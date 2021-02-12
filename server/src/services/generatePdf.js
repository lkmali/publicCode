const fs = require("fs");
const PDFDocument = require("pdfkit");
var log = require("../logger/winston").LOG;
var config = require('../../config');

class GeneratePdfService {
    createInvoice(invoice) {
        let doc = new PDFDocument({size: "A4", margin: 50});
        this.generateHeader(doc);
        this.generateCustomerInformation(doc, invoice);
        this.generateInvoiceTable(doc, invoice);
        doc.end();
        return doc;
    }

    generateHeader(doc) {
        doc
            .image(require("path").join(config.rootPath, "public/images/app-logo.png"), 50, 45, {width: 50})
            .fillColor("#444444")
            .fontSize(20)
            .text("mtc", 110, 57)
            .moveDown();
    }

    generateCustomerInformation(doc, order) {
        doc
            .fillColor("#444444")
            .fontSize(20)
            .text("Invoice", 50, 160);

        this.generateHr(doc, 185);

        const customerInformationTop = 200;

        doc
            .fontSize(10)
            .text("Invoice Number:", 50, customerInformationTop)
            .font("Helvetica-Bold")
            .text(order.payment.trackingId, 150, customerInformationTop)
            .font("Helvetica")
            .text("Invoice Date:", 50, customerInformationTop + 15)
            .text(this.getFormattedDate(order.modifiedAt), 150, customerInformationTop + 15)
            .text("Order Status::", 50, customerInformationTop + 30)
            .text(order.status,
                150,
                customerInformationTop + 30
            ).text("Payment Status:", 50, customerInformationTop + 45)
            .text(order.payment.status, 150, customerInformationTop + 45)

            .font("Helvetica-Bold")
            .text(`${order.billingInfo.name.charAt(0).toUpperCase() + order.billingInfo.name.slice(1)}`, 300, customerInformationTop)
            .font("Helvetica")
            .text(`${order.billingInfo.houseNo || ""} ${order.billingInfo.area || ""} ${order.billingInfo.landmark || ""}`, 300, customerInformationTop + 15)
            .text(`${order.billingInfo.city || ""},${order.billingInfo.state || ""} ${order.billingInfo.country || ""} ${order.billingInfo.pinCode}`,
                300,
                customerInformationTop + 30
            ).text(`${order.billingInfo.mobileNo || ""}  `,
            300,
            customerInformationTop + 45
        )
            .moveDown();

        this.generateHr(doc, 267);
    }

    generateInvoiceTable(doc, order) {
        let index;
        const invoiceTableTop = 330;

        doc.font("Helvetica-Bold");
        this.generateTableRow(
            doc,
            invoiceTableTop,
            "S.no",
            "Product",
            "HSN CODE",
            "Price",
            "Quantity",
            "GST %",
            "Total"
        );
        this.generateHr(doc, invoiceTableTop + 20);
        doc.font("Helvetica");
        for (index = 0; index < order.cart.length; index++) {
            const cart = order.cart[index];
            const position = invoiceTableTop + (index + 1) * 30;
            this.generateTableRow(
                doc,
                position,
                `${index + 1}.`,
                `${cart.item.name}(${cart.weight})`,
                `${cart.item.hsnCode || ''}`,
                `${cart.currency || ''} ${cart.actualAmount}`,
                `${cart.quantity}`,
                `${cart.gst || ''}`,
                `${cart.currency || ''} ${cart.price}`,
            );

            this.generateHr(doc, position + 20);
        }
        doc.font("Helvetica-Bold");
        const subtotalPosition = invoiceTableTop + (index + 1) * 30;
        this.generateTableRow(
            doc,
            subtotalPosition,
            "",
            "",
            "",
            "",
            "Subtotal",
            "",
            `${order.payment.currency} ${order.payment.actualAmount}`
        );
        const paidToDatePosition = subtotalPosition + 20;
        doc.font("Helvetica-Bold");
        this.generateTableRow(
            doc,
            paidToDatePosition,
            "",
            "",
            "",
            "",
            "CGST",
            "",
            `${order.payment.currency} ${order.payment.cGst}`
        );
        const duePosition = paidToDatePosition + 25;
        doc.font("Helvetica-Bold");
        this.generateTableRow(
            doc,
            duePosition,
            "",
            "",
            "",
            "",
            "SCGT",
            "",
            `${order.payment.currency} ${order.payment.sGst}`
        );
        doc.font("Helvetica-Bold");
        const TextPosition = duePosition + 25;
        this.generateTableRow(
            doc,
            TextPosition,
            "",
            "",
            "",
            "",
            "Tax",
            "",
            `${order.payment.currency} ${order.payment.taxAmount}`
        );
        doc.font("Helvetica-Bold");

        var roundOfPosition = TextPosition;
        if (this.getRoundOf(order.payment.total)) {
            roundOfPosition = TextPosition + 25;
            this.generateTableRow(
                doc,
                roundOfPosition,
                "",
                "",
                "",
                "",
                "Round Off ",
                "",
                `${order.payment.currency} ${this.getRoundOf(order.payment.total)}`
            );
        }

        const netBalance = roundOfPosition + 25;
        this.generateTableRow(
            doc,
            netBalance,
            "",
            "",
            "",
            "",
            "Net Amount",
            "",
            `${order.payment.currency} ${this.getNetBalance(order.payment.total)}`
        );
        doc.font("Helvetica-Bold");
    }


    generateTableRow(
        doc,
        y,
        sNo,
        item,
        hsn,
        price,
        quantity,
        tax,
        total
    ) {
        doc
            .fontSize(7)
            .text(sNo, 50, y, {width: 20})
            .text(item, 80, y, {width: 100})
            .text(hsn, 190, y, {width: 60})
            .text(price, 260, y, {width: 60})
            .text(quantity, 330, y, {width: 60})
            .text(tax, 400, y, {width: 60})
            .text(total, 470, y);
    }


    generateHr(doc, y) {
        doc
            .strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    }

    formatCurrency(cents) {
        return "$" + (cents / 100);
    }

    getFormattedDate(date) {

        const month = {
            0: 'Jan',
            1: 'Feb',
            2: 'Mar',
            3: 'Apr',
            4: 'May',
            5: 'Jun',
            6: 'Jul',
            7: 'Aug',
            8: 'Sep',
            9: 'Oct',
            10: 'Nov',
            11: 'Dec'
        };
        const newDate = new Date(date);
        return month[newDate.getMonth()] + " " + newDate.getDate() + ", " + newDate.getFullYear();
    }

    getRoundOf(num) {
        let data = parseFloat(num);
        var decimal = data - Math.floor(data);
        if (decimal > .50) {
            var decimal1 = 1 - decimal;
            return `+${parseFloat(decimal1).toFixed(2)}`
        } else {
            if (!decimal) {
                return false;
            } else {
                return `-${parseFloat(decimal).toFixed(2)}`
            }

        }
    }

    getNetBalance(num) {
        let data = parseFloat(num);
        var decimal = data - Math.floor(data);
        if (decimal > .50) {
            return `${Math.ceil(data)}`
        } else {
            return `${Math.floor(data)}`
        }
    }
}

module
    .exports
    .GeneratePdfService = GeneratePdfService;


