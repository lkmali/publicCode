import {RouterModule, Routes} from "@angular/router";
import {OrderComponent} from "@/_components/admin/order/order.component";
import {ViewOrderComponent} from "@/_components/admin/order/view-order/view-order.component";
import {CreateCategoryComponent} from "@/_components/admin/category/create-category/create-category.component";

const categoryRoute: Routes = [
    {path: "", component: OrderComponent},
    {
        path: "view/:id",
        component: ViewOrderComponent
    },
];
export const OrderRouting = RouterModule.forChild(categoryRoute);
