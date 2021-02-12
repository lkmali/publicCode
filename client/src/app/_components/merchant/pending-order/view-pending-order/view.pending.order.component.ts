import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {AlertService, EventService, MerchantCartService, OrderDeliveryService} from "@/_services";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {ConformModelComponent} from "@/_components/common/model/conform-model/conform.model.component";

@Component({templateUrl: 'view.pending.order.component.html', selector: 'merchant-cart'})
export class ViewPendingOrderComponent implements OnInit {
    merchantCart: any = [];
    orderId: string = "";
    gettingOrder = false;
    conformation = false;
    private _subs: Subscription;
    buttonFlag = {};
    inputBoxError = [];
    priceRequest = {};
    submit = false;
    bsModalRef: BsModalRef;
    color: any = {
        false: "#00ff00",
        true: "#ff0000"

    };

    constructor(private alertService: AlertService,
                private route: ActivatedRoute,
                private orderDeliveryService: OrderDeliveryService,
                private merchantCartService: MerchantCartService,
                private broadcaster: EventService,
                private modalService: BsModalService) {

    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            if (params["id"]) {
                this.orderId = params["id"];
                this.gettingOrder = true;
                this.getMerchantCartByMerchant();
                this.broadcaster.GetEvent("ORDER_UPDATE_" + this.orderId).subscribe(event => {
                    this.getMerchantCartByMerchant();
                });
            }
        });

    }

    getImageUrl(url) {
        if (url) {
            return `${config.api.base}${url}`;
        } else {
            return `${config.api.url}/assets/images/avatar-default.png`
        }

    }


    conformOrder() {
        if (this.inputBoxError.length) {
            return;
        }
        const request = {
            orderId: this.orderId,
            merchantCart: []
        };
        for (let index = 0; index < this.merchantCart.length; index++) {
            request["merchantCart"].push({
                id: this.merchantCart[index]._id,
                price: this.merchantCart[index].price,
                isDeleted: this.merchantCart[index].isDeleted
            })
        }
        const initialState = {};
        this.bsModalRef = this.modalService.show(ConformModelComponent, {initialState});
        this.bsModalRef.content.closeBtnName = 'Close';
        this.bsModalRef.content.closePopup.subscribe(result => {
            if (result) {
                this.conformAllItemByMerchant(request);
            }
        });

    }

    getMerchantCartByMerchant() {

        this._subs = this.merchantCartService.getPendingOrder(this.orderId).subscribe(result => {
            if (result && result['success'] && result['data'] && result["data"].data) {
                this.conformation = result['data'].conformation === true || result['data'].conformation === 'true';
                this.merchantCart = result['data'].data;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingOrder = false;
        }, (err) => {
            this.gettingOrder = false;
            this.alertService.error(err["message"] || err);
        });
    }

    onPriceChange(cartItem, index, event) {
        if (this.inputBoxError[index]) {
            this.inputBoxError.splice(index, 1);
        }
        if (!event) {
            this.inputBoxError[index] = "Price can't be more the actual item price";

            this.merchantCart[index]["price"] = this.convertStingToNub(cartItem.actualAmount);
            return;

        }
        console.log("eventeventevent", cartItem.actualAmount);
        if (this.convertStingToNub(cartItem.actualAmount) < this.convertStingToNub(event)) {
            this.inputBoxError[index] = "Price can't be more the actual item price";
            this.merchantCart[index]["price"] = this.convertStingToNub(cartItem.actualAmount);
            console.log("  11this.inputBoxError", this.inputBoxError);
            console.log("  11this.inputBoxError", this.merchantCart[index]);
            return;
        } else {
            this.merchantCart[index]["price"] = this.convertStingToNub(event);
            return;
        }
    }

    stock(index, flag) {
        this.merchantCart[index]["isDeleted"] = flag;
    }

    conformAllItemByMerchant(request) {
        this.submit = true;
        this._subs = this.merchantCartService.conformAllItemByMerchant(request).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.inputBoxError = [];
                this.alertService.success('Your Conformation send successfully');
                this.getMerchantCartByMerchant();
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.submit = false;
        }, (err) => {
            this.submit = false;
            this.alertService.error(err["message"] || err);
        });


    }

    convertStingToNub(x) {
        return parseFloat(x)
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        if (this._subs) {
            this._subs.unsubscribe();
        }


    }
}

