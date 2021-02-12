import {NgModule} from "@angular/core";
import {DashboardCommonModule} from "../../common/common.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DeliveryBoyRouting} from "./deliveryBoy.routing";
import {DeliveryBoyComponent} from "@/_components/admin/deliveryBoy/deliveryBoy.component";
import {CreateDeliveryBoyComponent} from "@/_components/admin/deliveryBoy/create-deliveryBoy/create-deliveryBoy.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DashboardCommonModule,
        DeliveryBoyRouting
    ],
    declarations: [DeliveryBoyComponent, CreateDeliveryBoyComponent],
    exports: [],
})
export class DeliveryBoyModule {
}
