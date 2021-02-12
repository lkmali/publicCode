import {Component, OnInit} from '@angular/core';
import {AlertService, AuthenticationService, UserService} from "@/_services";
import {Subscription} from "rxjs";
import {UnitService} from "@/_services/unit.service";
import {UpdateMerchantComponent} from "@/_components/common/model/update-merchant-item/update.merchant.component";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {AddUnitComponent} from "@/_components/admin/unit/add-unit/add.unit.component";

@Component({templateUrl: 'unit.component.html'})
export class UnitComponent implements OnInit {
    units: any[] = [];
    private _subs: Subscription;
    bsModalRef: BsModalRef;

    constructor(
        private unitService: UnitService,
        private authenticationService: AuthenticationService,
        private modalService: BsModalService,
        private alertService: AlertService) {
    }

    ngOnInit() {
        this.getUnits();
    }


    gettingUnits = true;

    addUnit() {
        const initialState = {};
        this.bsModalRef = this.modalService.show(AddUnitComponent, {initialState});
        this.bsModalRef.content.closeBtnName = 'Close';
        this.bsModalRef.content.closePopup.subscribe(result => {
            if (result) {
                this.alertService.success('Unit Added Successfully');
                this.getUnits();
            }
        });
    }

    getUnits() {
        this.gettingUnits = true;
        this._subs = this.unitService.getUnit().subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.units = result.data;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingUnits = false;
        }, (err) => {
            this.gettingUnits = false;
            this.alertService.error(err["message"] || err);
        });
    }

    deleteUnit(name) {
        this._subs = this.unitService.deleteUnit(name).subscribe(data => {
            if (data['success']) {
                this.alertService.success("Unit deleted successfully");
                this.getUnits();
            } else if (data['error']) {
                this.alertService.error(data['error']['message']);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this._subs.unsubscribe();

    }

}
