import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, CategoryService} from "@/_services";

@Component({templateUrl: 'category.component.html'})
export class CategoryComponent implements OnInit {
    origin: string = window.location.origin;
    category: Array<any> = [];
    filter: { pageIndex: number; pageSize: number; offset: number };
    totalItems: any = 0;
    gettingCategory = false;
    private _subs: Subscription;
    fileToUpload: null;
    searchText: string = "";
    activation = {
        false: "deactivate",
        true: "activate"
    };
    loader = false;

    constructor(private alertService: AlertService,
                private categoryService: CategoryService, private router: Router) {

    }

    ngOnInit() {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        this.getCategory();

    }

    onSearch(event) {
        this.searchText = event;
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        if (event.length >= 2) {
            this.getCategory();
        }
        if (event) {
            this.getCategory();
        }
    }

    createCategory() {
        this.router.navigate([`/admin/create`]);
    }

    getItem(id) {
        this.router.navigate(['category/item/' + id]);
    }

    onFileChange(event) {
        if (event.target.files.length > 0) {
            var reader = new FileReader();
            const file = event.target.files[0];
            // console.log(file)
            this.fileToUpload = file
            // this.editOrganizationForm.patchValue({
            //     fileSource: file
            // });
        }
    }

    saveCategoryFile() {
        const formData = new FormData();
        formData.append("categoryFile", this.fileToUpload);
        this.loader = true;
        this._subs = this.categoryService.uploadFile(formData).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.alertService.success('Category data updated Successfully ');
                this.getCategory();
                this.fileToUpload = null;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.loader = false;
        }, (err) => {
            this.loader = false;
            this.alertService.error(err["message"] || err);
        });
    }

    DeleteCategory(data) {
        this._subs = this.categoryService.action(this.activation[data.isDeleted], data._id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.getCategory();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    getCategory() {
        this.gettingCategory = true;
        this._subs = this.categoryService.get(this.filter.pageSize, this.filter.offset, this.searchText).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.category = result.data.records;
                this.totalItems = result.data.total;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingCategory = false;
        }, (err) => {
            this.gettingCategory = false;
            this.alertService.error(err["message"] || err);
        });
    }

    pageChanged(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = parseInt(filter.pageSize);
        this.filter.pageIndex = filter.pageIndex;
        this.getCategory();
    }

    saveFile() {

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
        if (this._subs) {
            this._subs.unsubscribe();
        }


    }

}

