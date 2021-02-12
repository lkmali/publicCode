import {Component, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {Subject, Subscription} from 'rxjs';
import {AlertService, MerchantItemService} from "@/_services";
import {UnitService} from "@/_services/unit.service";

@Component({templateUrl: 'add.unit.component.html'})
export class AddUnitComponent implements OnInit {
    submitForm: boolean = false;
    item: any;
    unit = "";
    error: any = "";
    closePopup: Subject<any>;
    private _subs: Subscription;

    constructor(
        public bsModalRef: BsModalRef,
        private alertService: AlertService,
        private unitService: UnitService
    ) {
    }

    ngOnInit() {
        this.closePopup = new Subject<any>();
    }


    close() {
        this.bsModalRef.hide();
    }

    saveUnit() {
        if (!this.unit) {
            return;
        }
        this.submitForm = true;
        //this.filter.offset, this.filter.pageSize, this.searchText, this.ItemId,
        this._subs = this.unitService.saveUnit({name: this.unit}).subscribe((result: any) => {
            if (result && result['success'] && result['data']) {
                this.closePopup.next(result['data']);
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.submitForm = false;
            this.bsModalRef.hide();
        }, (err) => {
            this.bsModalRef.hide();
            this.submitForm = false;
            this.alertService.error(err["message"] || err);
        });
    }
}
