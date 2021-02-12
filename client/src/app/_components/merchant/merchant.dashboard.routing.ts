import {RouterModule, Routes} from "@angular/router";
import {ViewPendingOrderComponent} from "@/_components/merchant/pending-order/view-pending-order/view.pending.order.component";
import {ConfirmedOrderComponent} from "@/_components/merchant/confirmed-order/confirmed.order.component";
import {ViewConfirmedOrderComponent} from "@/_components/merchant/confirmed-order/view-confirmed-order./view.confirmed.order.component";
import {PendingOrderComponent} from "@/_components/merchant/pending-order/pending.order.component";
import {MerchantDashboardComponent} from "@/_components/merchant/merchant.dashboard.component";
import {AddMerchantCategoryComponent} from "@/_components/common/add-merchant-category/add.merchant.category.component";
import {AddMerchantItemComponent} from "@/_components/common/add-merchant-item/add.merchant.item.component";
import {ViewMerchantCategoryComponent} from "@/_components/common/view-merchant-category/view.merchant.category.component";
import {ViewMerchantItemComponent} from "@/_components/common/view-merchant-item/view.merchant.item.component";
import {ViewMerchantProfileComponent} from "@/_components/common/view-merchant-profile/view.merchant.profile.component";

const categoryRoute: Routes = [
    {
        path: "", component: MerchantDashboardComponent,
        children: [
            {
                path: "",
                component: ViewMerchantProfileComponent
            },
            {
                path: "pending/order",
                component: PendingOrderComponent
            },
            {
                path: "pending/order/view/:id",
                component: ViewPendingOrderComponent
            },
            {
                path: "conform/order",
                component: ConfirmedOrderComponent
            },
            {
                path: "conform/order/view/:id",
                component: ViewConfirmedOrderComponent
            },
            {
                path: "category",
                component: ViewMerchantCategoryComponent
            },
            {
                path: "addCategory",
                component: AddMerchantCategoryComponent
            },
            {
                path: "addItem",
                component: AddMerchantItemComponent
            },
            {
                path: "addItem/:categoryId",
                component: AddMerchantItemComponent
            },
            {
                path: "item",
                component: ViewMerchantItemComponent
            },
            {
                path: "item/:id",
                component: ViewMerchantItemComponent
            }
        ]
    }
];
export const MerchantDashboardRouting = RouterModule.forChild(categoryRoute);
