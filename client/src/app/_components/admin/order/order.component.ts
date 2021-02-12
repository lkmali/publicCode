import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, EventService, OrderService} from "@/_services";

@Component({templateUrl: 'order.component.html'})
export class OrderComponent implements OnInit {
    origin: string = window.location.origin;
    orders: Array<any> = [];
    filter: { pageIndex: number; pageSize: number; offset: number };
    totalItems: any = 0;
    gettingOrder = false;
    private _subs: Subscription;
    status: string = "All";
    color: any = {
        "Pending": "#b3d9ff",
        "Dispatch": "#ffff00",
        "Delivered": "#00ff00",
        "Cancel": "#ff0000",
        "Replace": "#ff1aff",

    };
    loader = false;
    statusArray: any[] = ["Pending", "Cancel", "Replace"];

    constructor(private alertService: AlertService, private broadcaster: EventService,
                private orderService: OrderService, private router: Router) {

    }

    ngOnInit() {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        this.getOrder();
        this.broadcaster.GetEvent("NEW_ORDER_RECEIVED").subscribe(event => {
            console.log("NEW_ORDER_RECEIVED", event);
            this.getOrder()
        });
    }

    onChangeFilter() {
        this.getOrder();
    }


    getOrder() {
        this.gettingOrder = true;
        console.log("this.status", this.status);
        this._subs = this.orderService.getOrder(this.filter.offset, this.filter.pageSize, this.status).subscribe(result => {
            if (result && result['success'] && result['data']) {
                console.log("result['data']", result['data']);
                this.orders = result.data.records;
                this.totalItems = result.data.total;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingOrder = false;
        }, (err) => {
            this.gettingOrder = false;
            this.alertService.error(err["message"] || err);
        });
    }

    pageChanged(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = parseInt(filter.pageSize);
        this.filter.pageIndex = filter.pageIndex;
        this.getOrder();
    }

    onChangeItemStatusFilter(status, id) {
        this.deliveredOrder(id, status)
    }

    deliveredOrder(id, status) {
        this._subs = this.orderService.deliveredOrder(id, status).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.alertService.success('Order status updated Successfully ');
                this.getOrder();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    getImageUrl(url) {
        if (url) {
            return `${config.api.base}${url}`;
        } else {
            return `${config.api.url}/assets/images/avatar-default.png`
        }

    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this._subs.unsubscribe();

    }

}

