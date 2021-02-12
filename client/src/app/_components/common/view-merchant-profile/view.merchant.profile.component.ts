import {Component, Input, OnChanges, OnInit} from "@angular/core";
import {AlertService, AuthStorage, MerchantService} from "@/_services";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({templateUrl: "view.merchant.profile.component.html"})
export class ViewMerchantProfileComponent implements OnInit {
    merchantForm: FormGroup;
    private _subs: Subscription;
    submit = false;
    loaderItem = false;
    mapLink = "http://www.google.com/maps/place/";
    authStorage = new AuthStorage();
    loader = false;

    constructor(
        private alertService: AlertService,
        private merchantService: MerchantService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder
    ) {
    }

    ngOnInit(): void {
        this.setMerchantForm();
        this.getMerchant();
    }

    get f() {
        return this.merchantForm.controls;
    }

    getMerchant() {
        this.loaderItem = true;
        this._subs = this.merchantService.getById().subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.setEditMerchantForm(result['data']);
            } else if (result && result.hasOwnProperty("error")) {
                this.loaderItem = false;
                this.alertService.error(result.error.message || result.error);
                this.router.navigate([`admin/merchant`]);
            }
        }, (err) => {
            this.router.navigate([`admin/merchant`]);
            this.alertService.error(err["message"] || err);
        });
    }

    setMerchantForm() {
        this.merchantForm = this.formBuilder.group({
            name: ["", Validators.required],
            shopName: ["", Validators.required],
            phone: ["", Validators.required],
            pinCode: ["", Validators.required],
            mapLocation: ["", Validators.required],
            area: ["", Validators.required],
            landmark: [""],
            state: ["RAJASTHAN"],
            city: [""],
            country: ["INDIA"]
        });
    }

    setEditMerchantForm(data) {
        this.merchantForm = this.formBuilder.group({
            name: [data.name, Validators.required],
            phone: [data.phone, Validators.required],
            pinCode: [data.pinCode, Validators.required],
            shopName: [data.shopName, Validators.required],
            mapLocation: [data.mapLocation, Validators.required],
            area: [data.area, Validators.required],
            landmark: [data.landmark],
            state: [data.state],
            city: [data.city],
            country: [data.country]
        });
        this.mapLink = `${this.mapLink}${data.mapLocation.replace(/ /g, '')}`;
        this.loaderItem = false;
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        if (this._subs) {
            this._subs.unsubscribe();
        }


    }

    submitForm() {
        this.submit = true;
        if (this.merchantForm.invalid) {
            return;
        }

        this.saveMerchant(this.merchantForm.value);

    }

    saveMerchant(body) {
        this.loader = true;
        this._subs = this.merchantService.AddMerchant(body).subscribe(result => {
            if (result && result['success'] && result['data'] && result['data']) {
                this.alertService.success('Merchant data updated Successfully ', true);
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
