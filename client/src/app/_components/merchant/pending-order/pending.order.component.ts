import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, EventService, MerchantCartService, OrderDeliveryService} from "@/_services";

@Component({templateUrl: 'pending.order.component.html'})
export class PendingOrderComponent implements OnInit {
    origin: string = window.location.origin;
    orders: Array<any> = [];
    gettingOrder = false;
    private _subs: Subscription;
    loader = false;
    color: any = {
        false: "#ff0000",
        true: "#00ff00"

    };

    constructor(private alertService: AlertService,
                private route: ActivatedRoute,
                private broadcaster: EventService,
                private orderDeliveryService: OrderDeliveryService,
                private merchantCartService: MerchantCartService,
                private router: Router) {

    }

    ngOnInit() {
        this.getPendingOrder();
        this.broadcaster.GetEvent("ORDER_APPROVAL").subscribe(event => {
            this.getPendingOrder();
        });

    }

    getPendingOrder() {
        this.gettingOrder = true;
        this._subs = this.merchantCartService.getPendingOrder().subscribe(result => {
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
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this._subs.unsubscribe();

    }

}

