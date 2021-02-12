import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, MerchantItemService} from "@/_services";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {UpdateMerchantComponent} from "@/_components/common/model/update-merchant-item/update.merchant.component";

@Component({templateUrl: 'view.merchant.item.component.html'})
export class ViewMerchantItemComponent implements OnInit {

    categoryId: any;
    bsModalRef: BsModalRef;
    origin: string = window.location.origin;
    dataArray: Array<any> = [];
    filter: { pageIndex: number; pageSize: number; offset: number };
    totalItems: any = 0;
    gettingItem = false;
    allCheck = false;
    private _subs: Subscription;
    buttonFlag = {};
    searchText: string = "";

    constructor(private alertService: AlertService,
                private route: ActivatedRoute,
                private merchantItemService: MerchantItemService,
                private modalService: BsModalService,
                private router: Router) {

    }

    ngOnInit(): void {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        this.route.params.subscribe((params) => {
            if (params["id"]) {
                this.categoryId = params["id"];
                this.getMerchantItems()
            } else {
                this.getMerchantItems()
            }
        });
    }

    editItem(data) {
        const initialState = {
            item: {
                merchantItem: data._id,
                price: data.item.price,
                quantity: data.item.quantity,
                name: data.item.name,
                unit: data.item.unit,
                merchantItemPrice: data.price
            },
        };
        this.bsModalRef = this.modalService.show(UpdateMerchantComponent, {initialState});
        this.bsModalRef.content.closeBtnName = 'Close';
        this.bsModalRef.content.closePopup.subscribe(result => {
            if (result) {
                this.alertService.success('Item Updated Successfully');
                this.getMerchantItems();
            }
        });
    }

    onSearch(event) {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        if (this.searchText.length >= 2) {
            this.getMerchantItems()
        }
        if (!this.searchText) {
            this.getMerchantItems()
        }
    }

    pageChanged(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = parseInt(filter.pageSize);
        this.filter.pageIndex = filter.pageIndex;
        this.getMerchantItems()
    }


    getImageUrl(url) {
        if (url) {
            return `${config.api.base}${url}`;
        } else {
            return `${config.api.url}/assets/images/avatar-default.png`
        }

    }

    deleteMultipleCategory(name) {
        let request = {ids: []};
        let flag = this.allCheck;
        for (let index = 0; index < this.dataArray.length; index++) {
            if (flag || this.dataArray[index]["isChecked"] == true) {
                request.ids.push(this.dataArray[index]._id);
            }
        }
        if (request.ids && request.ids.length > 0) {
            this.deleteMerchantItems(name, request);
        }
    }

    updateMultipleCategory(data, name) {
        let request = {ids: [], updatedRequest: data};
        let flag = this.allCheck;
        for (let index = 0; index < this.dataArray.length; index++) {
            if (flag || this.dataArray[index]["isChecked"] == true) {
                request.ids.push(this.dataArray[index]._id);
            }
        }

        if (request.ids && request.ids.length > 0) {
            this.updateMerchantItems(name, request);
        }
    }

    checkAllBox() {
        this.allCheck = !this.allCheck;
        for (let index = 0; index < this.dataArray.length; index++) {
            this.dataArray[index]["isChecked"] = this.allCheck;
        }
    }

    checkSingleBox(index) {
        this.dataArray[index]["isChecked"] = !this.dataArray[index]["isChecked"];
        this.allCheck = false;
    }

    deleteMerchantItems(name, request) {
        this.buttonFlag[name] = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.ItemId,
        this._subs = this.merchantItemService.deleteMerchantItems(request).subscribe((result: any) => {
            if (result && result['success'] && result['data']) {
                this.getMerchantItems();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[name] = false;
        }, (err) => {
            this.buttonFlag[name] = false;
            this.alertService.error(err["message"] || err);
        });
    }

    updateMerchantItems(name, request) {
        this.buttonFlag[name] = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.ItemId,
        this._subs = this.merchantItemService.updateMerchantItems(request).subscribe((result: any) => {
            if (result && result['success'] && result['data']) {
                this.getMerchantItems();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[name] = false;
        }, (err) => {
            this.buttonFlag[name] = false;
            this.alertService.error(err["message"] || err);
        });
    }

    getMerchantItems() {
        this.gettingItem = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.ItemId,
        this._subs = this.merchantItemService.getMerchantItems({
            offset: this.filter.offset,
            limit: this.filter.pageSize,
            searchText: this.searchText,
            categoryId: this.categoryId
        }).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.allCheck = false;
                this.dataArray = result.data.records;
                this.totalItems = result.data.total;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingItem = false;
        }, (err) => {
            this.gettingItem = false;
            this.alertService.error(err["message"] || err);
        });
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this._subs.unsubscribe();

    }

}

