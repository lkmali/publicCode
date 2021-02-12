import {Component, Input, OnInit} from "@angular/core";
import {AlertService, DeliveryBoyService} from "@/_services";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({templateUrl: "create-deliveryBoy.component.html"})
export class CreateDeliveryBoyComponent implements OnInit {
    deliveryBoyForm: FormGroup;
    private _subs: Subscription;
    submit = false;
    loader = false;
    loaderItem = false;
    mapLink = "http://www.google.com/maps/place/";

    constructor(
        private alertService: AlertService,
        private deliveryBoyService: DeliveryBoyService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder
    ) {
    }

    get f() {
        return this.deliveryBoyForm.controls;
    }

    getDeliveryBoy(id) {
        this._subs = this.deliveryBoyService.getById(id).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.setEditDeliveryBoyForm(result['data']);
            } else if (result && result.hasOwnProperty("error")) {
                this.loaderItem = false;
                this.alertService.error(result.error.message || result.error);
                this.router.navigate([`admin/merchant`]);
            }
        }, (err) => {
            this.loaderItem = false;
            this.alertService.error(err["message"] || err);
            this.router.navigate([`admin/merchant`]);
        });
    }

    ngOnInit() {
        this.setDeliveryBoyForm();
        this.route.params.subscribe((params) => {
            if (params["id"]) {
                this.getDeliveryBoy(params["id"]);
            }
        });
    }

    setDeliveryBoyForm() {
        this.deliveryBoyForm = this.formBuilder.group({
            id: [""],
            name: ["", Validators.required],
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


    setEditDeliveryBoyForm(data) {
        this.deliveryBoyForm = this.formBuilder.group({
            id: [data._id],
            name: [data.name, Validators.required],
            phone: [data.phone, Validators.required],
            pinCode: [data.pinCode, Validators.required],
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
}
