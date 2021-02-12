import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, DeliveryBoyService} from "@/_services";

@Component({templateUrl: 'deliveryBoy.component.html'})
export class DeliveryBoyComponent implements OnInit {
    origin: string = window.location.origin;
    deliveryBoy: Array<any> = [];
    filter: { pageIndex: number; pageSize: number; offset: number };
    totalItems: any = 0;
    gettingDeliveryBoy = false;
    private _subs: Subscription;
    fileToUpload: null;
    searchText: string = "";
    activation = {
        false: "deactivate",
        true: "activate"
    };
    loader = false;

    constructor(private alertService: AlertService,
                private deliveryBoyService: DeliveryBoyService, private router: Router) {

    }

    ngOnInit() {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        this.getDeliveryBoy();

    }

    onSearch(event) {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        if (this.searchText.length >= 2) {
            this.getDeliveryBoy();
        }
        if (!this.searchText) {
            this.getDeliveryBoy();
        }
    }

    edit(id) {
        this.router.navigate([`admin/deliveryBoy/edit/${id}`]);
    }

    ActiveDeliveryBoy(data) {
        this._subs = this.deliveryBoyService.deliveryBoyAction(this.activation[data.isDeleted], data._id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.getDeliveryBoy();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    DeleteDeliveryBoy(data) {
        this._subs = this.deliveryBoyService.deleteDeliveryBoy(data._id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.getDeliveryBoy();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    getDeliveryBoy() {
        this.gettingDeliveryBoy = true;
        this._subs = this.deliveryBoyService.getDeliveryBoyByAdmin(this.filter.pageSize, this.filter.offset, this.searchText).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.deliveryBoy = result.data.records;
                this.totalItems = result.data.total;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingDeliveryBoy = false;
        }, (err) => {
            this.gettingDeliveryBoy = false;
            this.alertService.error(err["message"] || err);
        });
    }

    pageChanged(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = parseInt(filter.pageSize);
        this.filter.pageIndex = filter.pageIndex;
        this.getDeliveryBoy();
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this._subs.unsubscribe();

    }

}

