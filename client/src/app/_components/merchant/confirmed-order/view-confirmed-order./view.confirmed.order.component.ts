import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, AuthenticationService, EventService, OrderDeliveryService} from "@/_services";

@Component({templateUrl: 'view.confirmed.order.component.html'})
export class ViewConfirmedOrderComponent implements OnInit {
    orderDelivery: any = {};
    merchantCart: any[] = [];
    orderDeliveryId: string = "";
    gettingOrder = false;
    private _subs: Subscription;
    userId = "";
    color: any = {
        "Delivered": "#b3d9ff",
        "Dispatch": "#ffff00",
        "Confirmed": "#00ff00",
        "Rejected": "#ff0000",
        "Cancel": "#ff1aff",

    };


    constructor(private alertService: AlertService,
                private route: ActivatedRoute,
                private broadcaster: EventService,
                private authenticationService: AuthenticationService,
                private orderDeliveryService: OrderDeliveryService) {

    }

    ngOnInit(): void {
        this.broadcaster.GetEvent("whatever").subscribe(event => {
            console.log(event);
        });
        let user = this.authenticationService.getAuthData();
        this.route.params.subscribe((params) => {
            if (params["id"]) {
                this.orderDeliveryId = params["id"];
                this.getConformedOrder();
            }
        });

    }

    getImageUrl(url) {
        if (url) {
            return `${config.api.base}${url}`;
        } else {
            return `${config.api.url}/assets/images/avatar-default.png`
        }

    }

    getConformedOrder() {
        this._subs = this.orderDeliveryService.getConformedOrder(this.orderDeliveryId).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.orderDelivery = result['data'];
                this.merchantCart = this.orderDelivery.merchantCart;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
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

