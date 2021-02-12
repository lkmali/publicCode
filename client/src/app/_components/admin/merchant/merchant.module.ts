import {NgModule} from "@angular/core";
import {DashboardCommonModule} from "../../common/common.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MerchantRouting} from "./merchant.routing";
import {MerchantComponent} from "@/_components/admin/merchant/merchant.component";
import {CreateMerchantComponent} from "@/_components/admin/merchant/create-merchant/create-merchant.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DashboardCommonModule,
        MerchantRouting
    ],
    declarations: [MerchantComponent, CreateMerchantComponent],
    exports: [],
})
export class MerchantModule {
}
