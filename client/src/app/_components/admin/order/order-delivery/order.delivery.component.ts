import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, OrderDeliveryService} from "@/_services";

@Component({templateUrl: 'order.delivery.component.html', selector: 'order-delivery'})
export class OrderDeliveryComponent implements OnChanges {

    @Input('orderId') orderId;
    @Input('isOuterCalling') isOuterCalling;
    orders: any = {};
    gettingOrder = false;
    isConformOrderDeliveryButtonView = false;
    isDeliveryButtonView = false;
    private _subs: Subscription;
    orderDelivery: any = {};
    buttonFlag = {};

    merchantCart: any = [];

    constructor(private alertService: AlertService,
                private route: ActivatedRoute,
                private orderDeliveryService: OrderDeliveryService,
                private router: Router) {

    }

    ngOnChanges(): void {
        console.log(this.isOuterCalling);
        this.getOrderDelivery();
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

    getOrderDelivery() {
        this._subs = this.orderDeliveryService.getOrderDelivery(this.orderId).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.orderDelivery = result['data'];
                this.isDeliveryButtonView = false;
                this.isConformOrderDeliveryButtonView = false;
                if (this.orderDelivery.status === "Pending") {
                    this.isConformOrderDeliveryButtonView = true;
                    this.isDeliveryButtonView = false;
                }
                if (this.orderDelivery.status === "Confirmed") {
                    this.isDeliveryButtonView = true;
                    this.isConformOrderDeliveryButtonView = false;
                }
                this.merchantCart = this.orderDelivery.merchantCart;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    orderDeliverySuccessfully(name) {
        this.buttonFlag[name] = true;
        this._subs = this.orderDeliveryService.orderDeliverySuccessfully({
            orderId: this.orderId
        }).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.alertService.success('Update Status Successfully');
                this.getOrderDelivery();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[name] = false;
        }, (err) => {
            this.buttonFlag[name] = false;
            this.alertService.error(err["message"] || err);
        });

    }

    conformOrder(name) {
        this.buttonFlag[name] = true;
        this._subs = this.orderDeliveryService.conformOrderDelivery({
            orderId: this.orderId
        }).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.alertService.success('conform Status Successfully');
                this.getOrderDelivery();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[name] = false;
        }, (err) => {
            this.buttonFlag[name] = false;
            this.alertService.error(err["message"] || err);
        });

    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        if (this._subs) {
            this._subs.unsubscribe();
        }


    }
}

