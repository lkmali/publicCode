import {Component, OnInit} from "@angular/core";
import {AlertService, ItemService} from "@/_services";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {UnitService} from "@/_services/unit.service";

@Component({templateUrl: "create-item.component.html"})
export class CreateItemComponent implements OnInit {
    itemForm: FormGroup;
    private _subs: Subscription;
    submit = false;
    category: string = "";
    units = [];
    previewImage = null;
    fileToUpload = null;
    loader = false;

    constructor(
        private alertService: AlertService,
        private itemService: ItemService,
        private router: Router,
        private route: ActivatedRoute,
        private unitService: UnitService,
        private formBuilder: FormBuilder
    ) {
    }

    get f() {
        return this.itemForm.controls;
    }

    ngOnInit() {
        this.getUnits();
        this.route.params.subscribe((params) => {
            if (params["id"]) {
                this.category = params["id"];
            }
        });
        this.setItemForm();

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

    setItemForm() {
        this.itemForm = this.formBuilder.group({
            price: ["", Validators.required],
            quantity: [1],
            unit: ["Kg"],
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
        formData.append("category", this.category);
        formData.append("quantity", this.itemForm.value['quantity']);
        formData.append("unit", this.itemForm.value['unit']);
        formData.append("name", this.itemForm.value['itemName']);
        formData.append("price", this.itemForm.value['price']);
        formData.append("description", this.itemForm.value['description']);
        formData.append("gst", this.itemForm.value['gst']);
        formData.append("hsnCode", this.itemForm.value['hsnCode']);
        if (this.fileToUpload) {
            formData.append("preview", this.fileToUpload);
        }
        this.saveItem(formData);

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
    saveItem(formData) {
        this.loader = true;
        this._subs = this.itemService.save(formData).subscribe(result => {
            if (result && result['success'] && result['data'] && result['data']) {
                this.alertService.success('Item data Added Successfully ', true);
                this.router.navigate([`admin/item/edit/${result['data']._id}`]);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.loader = false;
        }, (err) => {
            this.loader = false;
            this.alertService.error(err["message"] || err);
        });
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        if (this._subs) {
            this._subs.unsubscribe();
        }


    }
}