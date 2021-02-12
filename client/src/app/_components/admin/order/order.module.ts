import {NgModule} from "@angular/core";
import {DashboardCommonModule} from "../../common/common.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";
import {OrderComponent} from "@/_components/admin/order/order.component";
import {OrderRouting} from "@/_components/admin/order/order.routing";
import {OrderService} from "@/_services/order.service";
import {ViewOrderComponent} from "@/_components/admin/order/view-order/view-order.component";
import {MerchantCartComponent} from "@/_components/admin/order/merchant-cart/merchant.cart.component";
import {OrderDeliveryComponent} from "@/_components/admin/order/order-delivery/order.delivery.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DashboardCommonModule,
        BsDatepickerModule.forRoot(),
        OrderRouting
    ],
    declarations: [OrderComponent, ViewOrderComponent, OrderDeliveryComponent, MerchantCartComponent],
    providers: [OrderService],
    exports: [],
})
export class OrderModule {
}
