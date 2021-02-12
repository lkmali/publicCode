import {RouterModule, Routes} from "@angular/router";
import {MerchantComponent} from "@/_components/admin/merchant/merchant.component";
import {CreateMerchantComponent} from "@/_components/admin/merchant/create-merchant/create-merchant.component";
import {ViewMerchantCategoryComponent} from "@/_components/common/view-merchant-category/view.merchant.category.component";
import {AddMerchantCategoryComponent} from "@/_components/common/add-merchant-category/add.merchant.category.component";
import {AddMerchantItemComponent} from "@/_components/common/add-merchant-item/add.merchant.item.component";
import {ViewMerchantItemComponent} from "@/_components/common/view-merchant-item/view.merchant.item.component";
import {ViewMerchantProfileComponent} from "@/_components/common/view-merchant-profile/view.merchant.profile.component";

const categoryRoute: Routes = [
    {path: "", component: MerchantComponent},
    {
        path: 'info', component: CreateMerchantComponent, children: [
            {path: '', pathMatch: 'full', component: ViewMerchantProfileComponent},
            {path: 'category', component: ViewMerchantCategoryComponent},
            {path: 'addCategory', component: AddMerchantCategoryComponent},
            {path: 'addItem', component: AddMerchantItemComponent},
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
        ],
    }
];
export const MerchantRouting = RouterModule.forChild(categoryRoute);
