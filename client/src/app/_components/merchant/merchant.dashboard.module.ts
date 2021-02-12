import {NgModule} from "@angular/core";
import {DashboardCommonModule} from "../common/common.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";

import {ViewPendingOrderComponent} from "@/_components/merchant/pending-order/view-pending-order/view.pending.order.component";
import {ConfirmedOrderComponent} from "@/_components/merchant/confirmed-order/confirmed.order.component";
import {PendingOrderComponent} from "@/_components/merchant/pending-order/pending.order.component";
import {ViewConfirmedOrderComponent} from "@/_components/merchant/confirmed-order/view-confirmed-order./view.confirmed.order.component";
import {MerchantDashboardRouting} from "@/_components/merchant/merchant.dashboard.routing";
import {MerchantDashboardComponent} from "@/_components/merchant/merchant.dashboard.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DashboardCommonModule,
        BsDatepickerModule.forRoot(),
        MerchantDashboardRouting
    ],
    declarations: [ConfirmedOrderComponent, ViewPendingOrderComponent, MerchantDashboardComponent, ViewConfirmedOrderComponent, PendingOrderComponent],
    exports: [],
})
export class MerchantDashboardModule {
}
