import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, AuthStorage, ItemService, MerchantItemService} from "@/_services";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {UpdateMerchantComponent} from "@/_components/common/model/update-merchant-item/update.merchant.component";

@Component({templateUrl: 'add.merchant.item.component.html'})
export class AddMerchantItemComponent implements OnInit {

    categoryId: any;
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
                private router: Router) {

    }

    ngOnInit(): void {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        this.route.params.subscribe((params) => {
            if (params["categoryId"]) {
                this.categoryId = params["categoryId"];
                this.getItems()
            } else {
                this.getItems()
            }
        });
    }

    onSearch(event) {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        if (this.searchText.length >= 2) {
            this.getItems()
        }
        if (!this.searchText) {
            this.getItems()
        }
    }

    pageChanged(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = parseInt(filter.pageSize);
        this.filter.pageIndex = filter.pageIndex;
        this.getItems()
    }


    getImageUrl(url) {
        if (url) {
            return `${config.api.base}${url}`;
        } else {
            return `${config.api.url}/assets/images/avatar-default.png`
        }

    }

    addMultipleItem(name) {
        let request = {items: []};
        let flag = this.allCheck;
        for (let index = 0; index < this.dataArray.length; index++) {
            if (flag || this.dataArray[index]["isChecked"] == true) {
                request.items.push(this.dataArray[index]._id);
            }
        }

        if (request.items && request.items.length > 0) {
            this.buttonFlag[name] = false;
            this.addMerchantItems(name, request);
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

    addMerchantItems(name, request) {
        this.buttonFlag[name] = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.ItemId,
        this._subs = this.merchantItemService.addMerchantItems(request).subscribe((result: any) => {
            if (result && result['success'] && result['data']) {
                this.getItems()
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[name] = false;
        }, (err) => {
            this.buttonFlag[name] = false;
            this.alertService.error(err["message"] || err);
        });
    }

    getItems() {
        this.gettingItem = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.ItemId,
        this._subs = this.merchantItemService.getUnselectedMerchantItem({
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

