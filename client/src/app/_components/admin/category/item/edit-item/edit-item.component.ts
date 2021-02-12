import {Component, OnInit} from "@angular/core";
import {AlertService, ItemService} from "@/_services";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {UnitService} from "@/_services/unit.service";

@Component({templateUrl: "edit-item.component.html"})
export class EditItemComponent implements OnInit {
    itemForm: FormGroup;
    private _subs: Subscription;
    submit = false;
    itemId: string;
    units: any = [];
    previewImage = null;
    images = {};
    itemData = {
        quantity:0,
        unit: "",
        price: 0,
        loader: false
    };
    uploadImage = {};
    fileToUpload = null;
    loader = false;
    property: any = [];
    ImageformData = new FormData();

    constructor(
        private alertService: AlertService,
        private itemService: ItemService,
        private router: Router,
        private unitService: UnitService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder
    ) {
    }

    get f() {
        return this.itemForm.controls;
    }

    getUnits() {
        this._subs = this.unitService.getUnit().subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.units = result.data;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    getItem(id) {
        this._subs = this.itemService.getById(id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.setEditItemForm(result['data']);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    ngOnInit() {
        this.getUnits();
        this.setItemForm();
        this.route.params.subscribe((params) => {
            if (params["id"]) {
                this.itemId = params["id"];
                this.getItem(params["id"]);
            }
        });
    }

    onFileChange(event) {
        if (event.target.files.length > 0) {
            const reader = new FileReader();
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

    onExtraImageUpload(event, id) {
        if (event.target.files.length > 0) {
            const reader = new FileReader();
            const file = event.target.files[0];
            reader.readAsDataURL(file);
            reader.onload = (_event) => {
                this.images[id] = reader.result;
            };
            this.ImageformData.append(id, file);
            // console.log(file)
            this.uploadImage[id] = file
            // this.editOrganizationForm.patchValue({
            //     fileSource: file
            // });
        }
    }

    setItemForm() {
        this.itemForm = this.formBuilder.group({
            id: [""],
            quantity: [1],
            unit: ["Kg"],
            price: ["", Validators.required, Validators.min(0)],
            itemName: ["", Validators.required],
            hsnCode: ["", Validators.required],
            gst: [0, Validators.required],
            description: ["", Validators.required]
        });
    }

    submitForm() {
        this.submit = true;
        const formData = new FormData();
        if (this.itemForm.invalid) {
            return;
        }
        if (!this.previewImage && !this.fileToUpload) {
            return;
        }
        formData.append("quantity", this.itemForm.value['quantity']);
        formData.append("unit", this.itemForm.value['unit']);
        formData.append("name", this.itemForm.value['itemName']);
        formData.append("price", this.itemForm.value['price']);
        formData.append("gst", this.itemForm.value['gst']);
        formData.append("hsnCode", this.itemForm.value['hsnCode']);
        formData.append("description", this.itemForm.value['description']);
        if (this.fileToUpload) {
            formData.append("preview", this.fileToUpload);
        }

        if (this.itemForm.value['id']) {
            this.editItem(this.itemForm.value['id'], formData);
        } else {
            this.saveItem(formData);
        }

    }

    addImageName(value) {
        if (!this.images.hasOwnProperty(value) && value) {
            this.images[value] = null;
        }
    }

    saveItem(formData) {
        this.loader = true;
        this._subs = this.itemService.save(formData).subscribe(result => {
            if (result && result['success'] && result['data'] && result['data']) {
                this.alertService.success('Item data updated Successfully ', true);
                this.getItem(this.itemId);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.loader = false;
        }, (err) => {
            this.loader = false;
            this.alertService.error(err["message"] || err);
        });
    }

    saveItemImage() {

        let flag = false;
        for (let key in this.images) {
            if (this.images[key]) {
                flag = true;

            }

        }
        if (flag) {
            this.loader = true;
            this._subs = this.itemService.saveItemImage(this.itemId, this.ImageformData).subscribe(result => {
                if (result && result['success'] && result['data'] && result['data']) {
                    this.alertService.success('Item data updated Successfully ', true);
                } else if (result && result.hasOwnProperty("error")) {
                    this.alertService.error(result.error.message || result.error);
                }
                this.loader = false;
            }, (err) => {
                this.loader = false;
                this.alertService.error(err["message"] || err);
            });
        }

    }

    saveExtraProperty() {
        this.loader = true;
        this._subs = this.itemService.update(this.itemId, {property: this.property}).subscribe(result => {
            if (result && result['success'] && result['data'] && result['data']) {
                this.alertService.success('Item data updated Successfully ', true);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.loader = false;
        }, (err) => {
            this.loader = false;
            this.alertService.error(err["message"] || err);
        });
    }

    editItem(id, formData) {
        this.loader = true;
        this._subs = this.itemService.update(id, formData).subscribe(result => {
            if (result && result['success'] && result['data'] && result['data']) {
                this.alertService.success('Item data updated Successfully ', true);
                this.getItem(this.itemId);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.loader = false;
        }, (err) => {
            this.loader = false;
            this.alertService.error(err["message"] || err);
        });
    }

    setEditItemForm(data) {
        this.itemForm = this.formBuilder.group({
            id: [data._id],
            itemName: [data.name, Validators.required],
            price: [data.price, Validators.required],
            description: [data.description, Validators.required],
            quantity: [data.quantity || 1, Validators.required],
            unit: [data.unit || 'Kg', Validators.required],
            hsnCode: [data.hsnCode || "", Validators.required],
            gst: [data.gst || 0, Validators.required],
        });
        this.itemData = {
            quantity:data.quantity,
            unit: data.unit,
            price: data.price,
            loader: true
        }
        if (data.preview) {
            this.previewImage = `${config.api.base}${data.preview}`
        }
        if (data.images) {
            for (let key in data.images) {
                if (data.images.hasOwnProperty(key)) {
                    this.images[key] = this.getImageUrl(data.images[key]);
                }

            }
            //this.images = data.images;
        }
        this.property = data.property || [];

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
