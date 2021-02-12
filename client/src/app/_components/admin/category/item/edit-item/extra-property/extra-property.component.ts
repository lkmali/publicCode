// @ts-ignore
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output
} from "@angular/core";

@Component({
    selector: 'extra-property',
    templateUrl: 'extra-property.component.html'
})
export class ExtraPropertyComponent implements OnChanges {
    @Input('data') property: any;
    @Input('unit') unit: any;
    @Input('quantity') quantity: any;
    @Input('price') price: any;
    @Input('loader') loader: boolean = false;
    inputBoxError = {};
    dataArray: any = [];
    quantitys = {};
    @Output()
    extraPropertyDelete: EventEmitter<any> = new EventEmitter();

    @Output()
    extraPropertySubmit: EventEmitter<any> = new EventEmitter();

    @Output()
    save: EventEmitter<any> = new EventEmitter();

    constructor() {
    }

    addProperty() {
        this.property.splice(2, 0, {
            quantity: "",
            discount: 0,
            price: 0,
            actualPrice: 0
        })
    }

    convertStingToNub(x) {
        return parseFloat(x)
    }

    fixDigit(x) {
        let data = parseFloat(x);
        return data.toFixed(2);
    }

    saveProperty() {
        let flag = false;
        for (let index = 0; index < this.property.length; index++) {
            this.inputBoxError[index] = {};
            if (!this.property[index].quantity) {
                this.inputBoxError[index]["quantity"] = "Quantity cant't be empty";
                flag = true;
                break;
            }
            this.property[index]["actualPrice"] = this.convertStingToNub(this.property[index].actualPrice || this.convertStingToNub(this.property[index].price));
            this.property[index].price = this.convertStingToNub(this.property[index].price);
            this.property[index].quantity = this.convertStingToNub(this.property[index].quantity);
            this.property[index].discount = this.convertStingToNub(this.property[index].discount);
            if (this.property[index].discount > 100) {
                this.inputBoxError[index]["price"] = "Percent should be less then 100";
                flag = true;
                break;
            }


        }
        if (flag) {
            return;
        } else {
            this.save.emit(this.property);
        }
    }

    removeProperty(index) {
        this.property.splice(index, 1);
        if (this.inputBoxError[index]) {
            delete this.inputBoxError[index];
        }
    }

    onChangeItemStatusFilter(value, index) {
        this.property[index]["discountType"] = value;
    }

    onValueChange(value, name, index) {
        this.inputBoxError[index] = {};
        if (isNaN(value)) {
            value = 0;
        }
        const IntValue = this.convertStingToNub(value);
        if (name === "discount") {
            if (!this.property[index]["quantity"]) {
                this.inputBoxError[index]["discount"] = "Please First add quantity";
            } else {
                const quantity = this.convertStingToNub(this.property[index]["quantity"]);
                if (IntValue < 100) {
                    const price = (this.convertStingToNub(this.price) * quantity) / this.quantity;
                    const dPrice = price - ((price * IntValue) / 100);
                    this.property[index]["discount"] = IntValue;
                    this.property[index]["price"] = dPrice;
                    this.property[index]["actualPrice"] = price;
                } else {
                    this.inputBoxError[index]["discount"] = "Percent should be less then 100";
                }


            }

        }
        if (name === "quantity") {
            console.log("IntValue", IntValue);
            console.log("getWeight", this.getWeight(IntValue, index));
            if (this.getWeight(IntValue, index)) {
                this.inputBoxError[index]["quantity"] = "Quantity Already exists";
            } else {
                this.property[index][name] = IntValue;
                if (!this.property[index]["discount"]) {
                    this.property[index]["discount"] = 0;
                }
                const discount = this.convertStingToNub(this.property[index]["discount"]);
                const price = (this.convertStingToNub(this.price) * IntValue) / this.quantity;
                const dPrice = price - ((price * discount) / 100);
                this.property[index]["discount"] = discount;
                this.property[index]["price"] = dPrice;
                this.property[index]["actualPrice"] = price;
            }

        }
    }

    ngOnChanges(): void {
        if (this.property.length <= 0) {
            this.property.splice(1, 0, {
                quantity: this.convertStingToNub(this.quantity),
                discount: 0,
                actualPrice: this.convertStingToNub(this.price),
                price: this.convertStingToNub(this.price)
            })
        }

    }

    getWeight(value, count) {
        var flag = false;
        for (let index = 0; index < this.property.length; index++) {
            if (count != index && this.property[index].quantity === value) {
                flag = true;
            }

        }
        return flag;

    }
}


