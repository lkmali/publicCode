import {Component, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {Subject} from 'rxjs';

@Component({templateUrl: 'conform.model.component.html'})
export class ConformModelComponent implements OnInit {
    closePopup: Subject<any>;

    constructor(
        public bsModalRef: BsModalRef
    ) {
    }

    ngOnInit() {
        this.closePopup = new Subject<any>();
    }

    close() {
        this.bsModalRef.hide();
    }

    updateMerchantItems() {
        this.closePopup.next(true);
        this.bsModalRef.hide();
    }
}
