import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {AlertService, CategoryService} from "@/_services";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({templateUrl: "create-category.component.html"})
export class CreateCategoryComponent implements OnInit {
    categoryForm: FormGroup;
    private _subs: Subscription;
    submit = false;
    previewImage = null;
    fileToUpload = null;
    loader = false;

    constructor(
        private alertService: AlertService,
        private categoryService: CategoryService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder
    ) {
    }

    get f() {
        return this.categoryForm.controls;
    }

    getCategory(id) {
        this._subs = this.categoryService.getById(id).subscribe(result => {
            if (result && result['success'] && result['data'] && result['data'].length) {
                this.setEditCategoryForm(result['data'][0]);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    ngOnInit() {
        this.setCategoryForm();
        this.route.params.subscribe((params) => {
            if (params["id"]) {
                this.getCategory(params["id"]);
            }
        });
    }

    onFileChange(event) {
        if (event.target.files.length > 0) {
            var reader = new FileReader();
            const file = event.target.files[0];
            reader.readAsDataURL(file);
            reader.onload = (_event) => {
                this.previewImage = reader.result;
            };
            // console.log(file)
            this.fileToUpload = file
            // this.editOrganizationForm.patchValue({
            //     fileSource: file
            // });
        }
    }

    setCategoryForm() {
        this.categoryForm = this.formBuilder.group({
            id: [""],
            categoryName: ["", Validators.required],
            description: ["", Validators.required]
        });
    }

    submitForm() {
        this.submit = true;
        const formData = new FormData();
        if (this.categoryForm.invalid) {
            return;
        }
        formData.append("name", this.categoryForm.value['categoryName']);
        formData.append("description", this.categoryForm.value['description']);
        if (this.fileToUpload) {
            formData.append("preview", this.fileToUpload);
        }

        if (this.categoryForm.value['id']) {
            this.editCategory(this.categoryForm.value['id'], formData);
        } else {
            this.saveCategory(formData);
        }

    }

    saveCategory(formData) {
        this.loader = true;
        this._subs = this.categoryService.save(formData).subscribe(result => {
            if (result && result['success'] && result['data'] && result['data']) {
                this.alertService.success('Category data updated Successfully ', true);
                this.router.navigate(['/']);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.loader = false;
        }, (err) => {
            this.loader = false;
            this.alertService.error(err["message"] || err);
        });
    }

    editCategory(id, formData) {
        this.loader = true;
        this._subs = this.categoryService.update(id, formData).subscribe(result => {
            if (result && result['success'] && result['data'] && result['data']) {
                this.alertService.success('Category data updated Successfully ', true);
                this.router.navigate(['/']);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.loader = false;
        }, (err) => {
            this.loader = false;
            this.alertService.error(err["message"] || err);
        });
    }

    setEditCategoryForm(data) {
        this.categoryForm = this.formBuilder.group({
            id: [data._id],
            categoryName: [data.name, Validators.required],
            description: [data.description, Validators.required]
        });
        if (data.preview) {
            this.previewImage = `${config.api.base}${data.preview}`
        }

    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        if(this._subs){
            this._subs.unsubscribe();
        }


    }
}
