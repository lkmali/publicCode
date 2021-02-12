// @ts-ignore
import {
    Component,
    EventEmitter,
    Input,
    OnChanges, OnInit,
    Output,
    SimpleChanges,
} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OfferImageService} from "@/_services/offerImage.service";
import {Subscription} from "rxjs";
import {AlertService} from "@/_services";

@Component({
    selector: 'offer-image-edit',
    templateUrl: 'offer.image.edit.component.html'
})
export class OfferImageEditComponent implements OnChanges {
    previewImage = null;
    fileToUpload = null;
    offerImageForm: FormGroup;
    private _subs: Subscription;
    submit = false;
    loader = false;
    @Input('itemId') item ?: any;
    @Input('offerImageId') id?: any;

    @Output()
    saveData ?: EventEmitter<any> = new EventEmitter();

    constructor(private formBuilder: FormBuilder, private offerImageService: OfferImageService, private alertService: AlertService,
    ) {
    }

    setOfferForm() {
        this.offerImageForm = this.formBuilder.group({
            id: [''],
            item: [this.item || ''],
            description: ["", Validators.required],
            title: ["", Validators.required]
        });
    }

    get f() {
        return this.offerImageForm.controls;
    }

    editOfferForm(data) {
        this.offerImageForm = this.formBuilder.group({
            id: [data._id || ''],
            item: [data.item || this.item || ''],
            description: [data.description || "", Validators.required],
            title: [data.title || "", Validators.required]
        });
        if (data.preview) {
            this.previewImage = `${config.api.base}${data.preview}`
        }
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

    submitForm() {
        this.submit = true;
        const formData = new FormData();
        if (this.offerImageForm.invalid) {
            return;
        }
        if (!this.previewImage && !this.fileToUpload) {
            return;
        }
        formData.append("id", this.offerImageForm.value['id']);
        formData.append("item", this.offerImageForm.value['item']);
        formData.append("title", this.offerImageForm.value["title"]);
        formData.append("description", this.offerImageForm.value['description']);
        if (this.fileToUpload) {
            formData.append("preview", this.fileToUpload);
        }

        this.saveOfferData(formData);

    }

    saveOfferData(formData) {
        this.loader = true;
        this._subs = this.offerImageService.addOfferImage(formData).subscribe(result => {
            if (result && result['success'] && result['data'] && result['data']) {
                this.alertService.success('OfferImage data updated Successfully ', true);
                this.saveData.emit({});
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.loader = false;
        }, (err) => {
            this.loader = false;
            this.alertService.error(err["message"] || err);
        });
    }

    getById(id) {
        this._subs = this.offerImageService.getById(id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.editOfferForm(result['data']);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            } else {
                this.setOfferForm();
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    getByItemId(id) {
        this._subs = this.offerImageService.getByItemId(id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.editOfferForm(result['data']);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            } else {
                this.setOfferForm();
            }
        }, (err) => {
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

    ngOnChanges(changes: SimpleChanges): void {
        console.log("this.item", this.item);
        this.setOfferForm();
        if (this.id) {
            this.getById(this.id)
        } else if (this.item) {
            this.getByItemId(this.item)
        }
    }

}
