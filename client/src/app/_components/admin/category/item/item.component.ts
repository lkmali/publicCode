import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, ItemService} from "@/_services";

@Component({templateUrl: 'item.component.html'})
export class ItemComponent implements OnInit {
    origin: string = window.location.origin;
    item: Array<any> = [];
    categoryId: string = "";
    filter: { pageIndex: number; pageSize: number; offset: number };
    totalItems: any = 0;
    gettingItem = false;
    allCheck = false;
    private _subs: Subscription;
    fileToUpload: null;
    buttonFlag = {};
    searchText: string = "";
    activation = {
        false: "deactivate",
        true: "activate"
    };
    stock = {
        AVAILABLE: "UN_AVAILABLE",
        UN_AVAILABLE: "AVAILABLE"
    };

    constructor(private alertService: AlertService,
                private route: ActivatedRoute,
                private itemService: ItemService, private router: Router) {

    }

    ngOnInit() {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        this.route.params.subscribe((params) => {
            if (params["id"]) {
                this.categoryId = params["id"];
                this.getItem();
            } else {
                this.getItem();
            }
        });


    }

    onSearch(event) {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        if (this.searchText.length >= 2) {
            this.getItem();
        }
        if (!this.searchText) {
            this.getItem();
        }
    }


    DeleteItem(data) {
        this._subs = this.itemService.action(this.activation[data.isDeleted], data._id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.alertService.success('Status updated Successfully ', true);
                this.getItem();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    ChangeStock(data) {
        this._subs = this.itemService.stockAction(this.stock[data.stock], data._id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.alertService.success('Stock updated Successfully ', true);
                this.getItem();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    getItem() {
        this.gettingItem = true;
        this._subs = this.itemService.getItem(this.filter.offset, this.filter.pageSize, this.searchText, this.categoryId,).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.allCheck = false;
                this.item = result.data.records;
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

    pageChanged(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = parseInt(filter.pageSize);
        this.filter.pageIndex = filter.pageIndex;
        this.getItem();
    }

    saveFile() {

    }

    ViewItem(id) {
        this.router.navigate([`admin/item/edit/${id}`]);
    }

    createItem() {
        this.router.navigate([`admin/item/create/${this.categoryId}`]);
    }

    getImageUrl(url) {
        if (url) {
            return `${config.api.base}${url}`;
        } else {
            return `${config.api.url}/assets/images/avatar-default.png`
        }

    }

    sendMultipleRequest(data, name) {
        let request = {ids: [], updatedRequest: data};
        let flag = this.allCheck;
        for (let index = 0; index < this.item.length; index++) {
            if (flag || this.item[index]["isChecked"] == true) {
                request.ids.push(this.item[index]._id);
            }
        }

        if (request.ids && request.ids.length > 0) {
            this.buttonFlag[name] = true;
            this._subs = this.itemService.UpdateAllItem(request).subscribe(result => {
                if (result && result['success'] && result['data']) {
                    this.getItem();
                } else if (result && result.hasOwnProperty("error")) {
                    this.alertService.error(result.error.message || result.error);
                }
                this.buttonFlag[name] = false;
            }, (err) => {
                this.buttonFlag[name] = false;
                this.alertService.error(err["message"] || err);
            });
        }
    }


    checkAllBox() {
        this.allCheck = !this.allCheck;
        for (let index = 0; index < this.item.length; index++) {
            this.item[index]["isChecked"] = this.allCheck;
        }
    }

    checkSingleBox(index) {
        this.item[index]["isChecked"] = !this.item[index]["isChecked"];
        this.allCheck = false;
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this._subs.unsubscribe();

    }

}

