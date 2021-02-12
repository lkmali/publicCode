import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, AuthStorage, MerchantService} from "@/_services";

@Component({templateUrl: 'merchant.component.html'})
export class MerchantComponent implements OnInit {
    origin: string = window.location.origin;
    merchant: Array<any> = [];
    filter: { pageIndex: number; pageSize: number; offset: number };
    totalItems: any = 0;
    gettingMerchant = false;
    private _subs: Subscription;
    fileToUpload: null;
    searchText: string = "";
    activation = {
        false: "deactivate",
        true: "activate"
    };
    loader = false;
    authStorage = new AuthStorage();

    constructor(private alertService: AlertService,
                private merchantService: MerchantService, private router: Router) {

    }

    ngOnInit() {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        this.getMerchant();

    }

    onSearch(event) {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        if (this.searchText.length >= 2) {
            this.getMerchant();
        }
        if (!this.searchText) {
            this.getMerchant();
        }
    }

    viewMerchant(merchantId) {
        this.authStorage.addMerchantId(merchantId);
        let url = `admin/merchant/info`;
        this.router.navigate([url]);
    }


    ActiveMerchant(data) {
        this._subs = this.merchantService.merchantAction(this.activation[data.isDeleted], data._id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.getMerchant();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    DeleteMerchant(data) {
        this._subs = this.merchantService.deleteMerchant(data._id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.getMerchant();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    getMerchant() {
        this.gettingMerchant = true;
        this._subs = this.merchantService.getMerchantByAdmin(this.filter.pageSize, this.filter.offset, this.searchText).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.merchant = result.data.records;
                this.totalItems = result.data.total;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingMerchant = false;
        }, (err) => {
            this.gettingMerchant = false;
            this.alertService.error(err["message"] || err);
        });
    }

    pageChanged(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = parseInt(filter.pageSize);
        this.filter.pageIndex = filter.pageIndex;
        this.getMerchant();
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this._subs.unsubscribe();

    }

}

