import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, EventService, MerchantCartService, OrderDeliveryService} from "@/_services";

@Component({templateUrl: 'confirmed.order.component.html'})
export class ConfirmedOrderComponent implements OnInit {
    origin: string = window.location.origin;
    orders: Array<any> = [];
    gettingOrder = false;
    private _subs: Subscription;
    loader = false;
    color: any = {
        "Delivered": "#b3d9ff",
        "Dispatch": "#ffff00",
        "Confirmed": "#00ff00",
        "Rejected": "#ff0000",
        "Cancel": "#ff1aff",

    };

    constructor(private alertService: AlertService,
                private broadcaster: EventService,
                private route: ActivatedRoute,
                private orderDeliveryService: OrderDeliveryService) {

    }

    ngOnInit() {
        this.broadcaster.GetEvent("ORDER_CONFORM").subscribe(event => {
            this.getConformedOrder();
        });
        this.getConformedOrder();

    }

    getConformedOrder() {
        this.gettingOrder = true;
        this._subs = this.orderDeliveryService.getConformedOrder().subscribe(result => {
            if (result && result['success'] && result['data']) {
                console.log("result['data']", result['data']);
                this.orders = result.data;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingOrder = false;
        }, (err) => {
            this.gettingOrder = false;
            this.alertService.error(err["message"] || err);
        });
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.


    }

}

