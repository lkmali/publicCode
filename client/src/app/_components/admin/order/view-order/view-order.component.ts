import {Component, OnInit} from "@angular/core";
import {AlertService, OrderService, DistanceService, MerchantService, EventService} from "@/_services";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {OrderDeliveryComponent} from "@/_components/admin/order/order-delivery/order.delivery.component";

@Component({templateUrl: "view-order.component.html"})
export class ViewOrderComponent implements OnInit {
    orders: any = {};
    orderId = "";
    gettingOrder = false;
    private _subs: Subscription;
    address: string = "";
    cart = [];
    mapLink = "http://www.google.com/maps/place/";
    deliveryBoys: any[];
    isOuterCalling = false;

    constructor(private alertService: AlertService,
                private broadcaster: EventService, private merchantService: MerchantService, private distanceService: DistanceService, private route: ActivatedRoute,
                private orderService: OrderService, private router: Router) {

    }

    ngOnInit(): void {

        this.route.params.subscribe((params) => {
            if (params["id"]) {
                this.orderId = params["id"];
                this.getDeliveryBoyDistance(params["id"]);
                this.getOrder(params["id"]);
                this.broadcaster.GetEvent("ORDER_UPDATE_" + this.orderId).subscribe(event => {
                    console.log("ORDER_UPDATE_", event);
                    this.getOrder(this.orderId);
                });
            }
        });
    }

    getOrder(id) {
        this.gettingOrder = true;
        this._subs = this.orderService.getById(id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.orders = result['data'];
                this.prepareInvoiceData(this.orders);
                console.log("result['data']", result['data']);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingOrder = false;
        }, (err) => {
            this.gettingOrder = false;
            this.alertService.error(err["message"] || err);
        });
    }

    getDeliveryBoyDistance(id) {
        this._subs = this.distanceService.getDeliveryBoyDistance(id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.deliveryBoys = result['data'];
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    getOrderDelivery(event) {
        this.isOuterCalling = !this.isOuterCalling;
    }

    prepareInvoiceData(orders) {


        console.log(orders.billingInfo);

        if (orders?.billingInfo?.mapLocation) {
            if (orders?.billingInfo?.mapLocation.hasOwnProperty("latlong")) {
                this.mapLink = `${this.mapLink}${orders?.billingInfo?.mapLocation.latlong.replace(/ /g, '')}`;
            }
        }
        console.log("this.mapLink", this.mapLink);
        this.address = `${orders?.billingInfo?.houseNo || ""} ${orders?.billingInfo?.area || ""} ${orders?.billingInfo?.landmark || ""} \n ${orders?.billingInfo?.city || ""} ${orders?.billingInfo?.state || ""} ${orders?.billingInfo?.country || ""}  ${orders?.billingInfo?.pinCode || ""}`;
        this.cart = orders.cart;
    }


    month = {
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

    convertMiterToKm(data) {
        return (data / 1000).toFixed(2);
    }

    getFormattedDate(date) {
        const newDate = new Date(date);
        return this.month[newDate.getMonth()] + " " + newDate.getDate() + ", " + newDate.getFullYear();
    }

    convertStingToNub(x) {
        return parseFloat(x)
    }

    printPdf() {
        const ael = document.activeElement;
        ael['disabled'] = true;
        ael['innerHTML'] = '<i class="fa fa-spinner fa-spin"></i>';
        this._subs = this.orderService.downloadAdminOrderInvoice(this.orderId, {responseType: 'arraybuffer'}).subscribe((res: any) => {
            console.log(res);
            ael['disabled'] = false;
            ael['innerHTML'] = '<i class="fa fa-print"></i> Print';
            const blob = new Blob([res], {
                type: 'application/pdf'
            });
            const blobURL = window.URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobURL;
            document.body.appendChild(iframe);
            iframe.contentWindow.print();
        }, (err) => {
            ael['disabled'] = false;
            ael['innerHTML'] = '<i class="fa fa-print"></i> Print';
            this.alertService.error(err["message"] || err);
        });
    }

    downloadPdf() {

        if (this.orders && this.orders.payment) {
            const ael = document.activeElement;
            ael['disabled'] = true;
            ael['innerHTML'] = '<i class="fa fa-spinner fa-spin"></i>';
            this._subs = this.orderService.downloadAdminOrderInvoice(this.orderId, {responseType: 'arraybuffer'}).subscribe((res: any) => {
                ael['disabled'] = false;
                ael['innerHTML'] = '<i class="fa fa-download"></i> Download';
                const blob = new Blob([res], {
                    type: 'application/pdf'
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = this.orders.payment.trackingId + "_invoice.pdf";
                a.click();
                window.URL.revokeObjectURL(url);
            }, (err) => {
                ael['disabled'] = false;
                ael['innerHTML'] = '<i class="fa fa-download"></i> Download';
                this.alertService.error(err["message"] || err);
            });
        }


    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        if (this._subs) {
            this._subs.unsubscribe();
        }


    }
}
