import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, ItemService, MerchantCategoryService, AuthStorage} from "@/_services";

@Component({templateUrl: 'view.merchant.category.component.html'})
export class ViewMerchantCategoryComponent implements OnInit {

    origin: string = window.location.origin;
    dataArray: Array<any> = [];
    filter: { pageIndex: number; pageSize: number; offset: number };
    totalItems: any = 0;
    gettingItem = false;
    allCheck = false;
    private _subs: Subscription;
    buttonFlag = {};
    searchText: string = "";
    authStorage = new AuthStorage();

    constructor(private alertService: AlertService,
                private route: ActivatedRoute,
                private merchantCategoryService: MerchantCategoryService,
                private itemService: ItemService,
                private router: Router) {

    }

    ngOnInit(): void {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        this.getMerchantCategories()
    }

    viewMerchantItem(categoryId) {
        const role = this.authStorage.getRole();
        let url = `merchant/item/${categoryId}`;
        if (role === 'admin') {
            let url = `/admin/merchant/info/item/${categoryId}`;
        }
        this.router.navigate([url]);
    }

    onSearch(event) {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        if (this.searchText.length >= 2) {
            this.getMerchantCategories()
        }
        if (!this.searchText) {
            this.getMerchantCategories()
        }
    }

    pageChanged(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = parseInt(filter.pageSize);
        this.filter.pageIndex = filter.pageIndex;
        this.getMerchantCategories()
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
            this.deleteMerchantCategories(name, request);
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
            this.updateMerchantCategories(name, request);
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

    deleteMerchantCategories(name, request) {
        this.buttonFlag[name] = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.categoryId,
        this._subs = this.merchantCategoryService.deleteMerchantCategories(request).subscribe((result: any) => {
            if (result && result['success'] && result['data']) {
                this.getMerchantCategories();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[name] = false;
        }, (err) => {
            this.buttonFlag[name] = false;
            this.alertService.error(err["message"] || err);
        });
    }

    updateMerchantCategories(name, request) {
        this.buttonFlag[name] = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.categoryId,
        this._subs = this.merchantCategoryService.updateMerchantCategories(request).subscribe((result: any) => {
            if (result && result['success'] && result['data']) {
                this.getMerchantCategories();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[name] = false;
        }, (err) => {
            this.buttonFlag[name] = false;
            this.alertService.error(err["message"] || err);
        });
    }

    addMerchantCategories(name, request) {
        this.buttonFlag[name] = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.categoryId,
        this._subs = this.merchantCategoryService.addMerchantCategories(request).subscribe((result: any) => {
            if (result && result['success'] && result['data']) {
                this.getMerchantCategories()
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.buttonFlag[name] = false;
        }, (err) => {
            this.buttonFlag[name] = false;
            this.alertService.error(err["message"] || err);
        });
    }

    getMerchantCategories() {
        this.gettingItem = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.categoryId,
        this._subs = this.merchantCategoryService.getMerchantCategories({
            offset: this.filter.offset,
            limit: this.filter.pageSize,
            searchText: this.searchText
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

