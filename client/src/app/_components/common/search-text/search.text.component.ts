import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, ItemService, MerchantItemService} from "@/_services";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {UpdateMerchantComponent} from "@/_components/common/model/update-merchant-item/update.merchant.component";

@Component({templateUrl: 'search.text.component.html', selector: 'search-text'})
export class SearchTextComponent implements OnChanges {
    timeOut;
    @Input('placeholder') placeholder: any;
    @Input('value') value: any;
    @Input('type') type: any;
    @Input('name') name: any;
    @Input('class') class: any;
    @Output()
    keyupMethod: EventEmitter<any> = new EventEmitter();

    @Output()
    changeMethod ?: EventEmitter<any> = new EventEmitter();
    timer = 500;

    constructor() {
        if (this.type === 'number') {
            this.timer = 1000;
        }

    }

    ngOnChanges(): void {
    }

    onKeyUp(value) {
        if (this.keyupMethod) {
            if (this.timeOut) {
                clearTimeout(this.timeOut);
            }
            this.timeOut = setTimeout(() => {
                console.log("keyupMethod");
                this.keyupMethod.emit(value)
            }, this.timer);
        }

    }

    onChange(value) {
        if (this.changeMethod) {
            if (this.timeOut) {
                clearTimeout(this.timeOut);
            }
            this.timeOut = setTimeout(() => {
                console.log("changeMethod");
                this.changeMethod.emit(value)
            }, this.timer);
        }

    }

}

