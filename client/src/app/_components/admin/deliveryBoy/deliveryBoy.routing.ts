import {RouterModule, Routes} from "@angular/router";
import {DeliveryBoyComponent} from "@/_components/admin/deliveryBoy/deliveryBoy.component";
import {CreateDeliveryBoyComponent} from "@/_components/admin/deliveryBoy/create-deliveryBoy/create-deliveryBoy.component";

const categoryRoute: Routes = [
    {path: "", component: DeliveryBoyComponent},
    {
        path: "create",
        component: CreateDeliveryBoyComponent
    },
    {
        path: "edit/:id",
        component: CreateDeliveryBoyComponent
    },


    {
        path: "",
        component: DeliveryBoyComponent
    },
];
export const DeliveryBoyRouting = RouterModule.forChild(categoryRoute);
