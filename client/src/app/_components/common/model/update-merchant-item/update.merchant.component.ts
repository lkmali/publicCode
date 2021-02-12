import {Component, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {Subject, Subscription} from 'rxjs';
import {AlertService, MerchantItemService} from "@/_services";

@Component({templateUrl: 'update.merchant.component.html'})
export class UpdateMerchantComponent implements OnInit {
    submitForm: boolean = false;
    item: any;
    price = 1;
    error: any = "";
    closePopup: Subject<any>;
    private _subs: Subscription;

    constructor(
        public bsModalRef: BsModalRef,
        private alertService: AlertService,
        private merchantItemService: MerchantItemService
    ) {
    }

    ngOnInit() {
        this.closePopup = new Subject<any>();
        this.price = this.item.merchantItemPrice;
    }

    onPriceChange() {
        this.error = "";
        console.log("this.item.price", this.item.price);
        console.log("this.price", this.price);
        if (this.item.price < this.price) {
            this.error = "Price can't be more the actual item price";
        }
    }


    close() {
        this.bsModalRef.hide();
    }

    updateMerchantItems() {
        if (this.error.length > 0) {
            return;
        }
        this.submitForm = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.ItemId,
        this._subs = this.merchantItemService.updateMerchantItemsPrice({
            merchantItem: this.item.merchantItem,
            price: this.price
        }).subscribe((result: any) => {
            if (result && result['success'] && result['data']) {
                this.closePopup.next(result['data']);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.submitForm = false;
            this.bsModalRef.hide();
        }, (err) => {
            this.bsModalRef.hide();
            this.submitForm = false;
            this.alertService.error(err["message"] || err);
        });
    }
}
