import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, EventService, MerchantCartService, OrderDeliveryService} from "@/_services";

@Component({templateUrl: 'merchant.cart.component.html', selector: 'merchant-cart'})
export class MerchantCartComponent implements OnChanges {

    @Input('cart') cart: any;
    @Input('orderId') orderId;
    orders: any = {};
    gettingOrder = false;
    isMerchantButtonView = false;
    private _subs: Subscription;
    merchants: any = {};
    buttonFlag = {};
    inputBoxError = {};
    priceRequest = {};
    @Output()
    getOrderDelivery: EventEmitter<any> = new EventEmitter();
    color: any = {
        false: "#00ff00",
        true: "#ff0000"

    };

    constructor(private alertService: AlertService,
                private route: ActivatedRoute,
                private broadcaster: EventService,
                private orderDeliveryService: OrderDeliveryService,
                private merchantCartService: MerchantCartService,
                private router: Router) {

    }

    ngOnChanges(): void {
        this.getMerchantCartByMerchant();
        this.broadcaster.GetEvent("ORDER_CONFORM_BY_MERCHANT_" + this.orderId).subscribe(event => {
            this.getMerchantCartByMerchant();
        });
    }

    getImageUrl(url) {
        if (url) {
            return `${config.api.base}${url}`;
        } else {
            return `${config.api.url}/assets/images/avatar-default.png`
        }

    }

    convertMiterToKm(data) {
        return (data / 1000).toFixed(2);
    }

    getMerchantCartByMerchant() {
        this._subs = this.merchantCartService.getMerchantCartByMerchant(this.orderId).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.merchants = result['data'];
                for (let key in this.merchants) {
                    if (this.merchants.hasOwnProperty(key)) {
                        this.isMerchantButtonView = true;
                        break;
                    }
                }
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }


    createOrderDelivery(name) {
        this.buttonFlag[name] = true;
        this._subs = this.orderDeliveryService.createOrderDelivery({
            orderId: this.orderId
        }).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.inputBoxError = {};
                this.priceRequest = {};
                this.getOrderDelivery.emit({});
                this.alertService.success('Delivery created Successfully');
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[name] = false;
        }, (err) => {
            this.buttonFlag[name] = false;
            this.alertService.error(err["message"] || err);
        });

    }

    convertStingToNub(x) {
        return parseFloat(x)
    }

    updateMerchantByAdmin(id, request = {}) {
        request["id"] = id;
        this._subs = this.merchantCartService.updateMerchantByAdmin(request).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.inputBoxError = {};
                this.priceRequest = {};
                this.alertService.success('Send Message SuccessFully');
                this.getMerchantCartByMerchant();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[id] = false;
        }, (err) => {
            this.buttonFlag[id] = false;
            this.alertService.error(err["message"] || err);
        });


    }

    onPriceChange(cartItem, id, event) {
        if (!event) {
            this.inputBoxError[id] = '';
            this.inputBoxError[id] = "Price can't be more the actual item price";
            console.log("  11this.inputBoxError", this.inputBoxError);
            return;

        }
        this.inputBoxError[id] = '';
        if (this.convertStingToNub(cartItem.actualAmount) < this.convertStingToNub(event)) {
            this.inputBoxError[id] = "Price can't be more the actual item price";
        } else {
            this.updateMerchantByAdmin(id, {price: this.convertStingToNub(event)})
        }
    }

    conformation(id, flag) {
        this.updateMerchantByAdmin(id, {conformation: flag})
    }

    stock(id, flag) {
        this.updateMerchantByAdmin(id, {isDeleted: flag})
    }

    getrowspan(data) {
        if (data && data.length) {
            return 2 * data.length
        } else {
            return 2
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

