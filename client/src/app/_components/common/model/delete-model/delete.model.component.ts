import {Component, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {first} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({templateUrl: 'delete.model.component.html'})
export class DeleteModelComponent implements OnInit {
    message: any;
    data: any;
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

    delete() {
        this.closePopup.next(this.data);
        this.bsModalRef.hide();
    }
}
