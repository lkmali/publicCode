import {Routes, RouterModule} from "@angular/router";
import {DashboardComponent} from "./dashboard.component";
import {UsersComponent} from "@/_components/admin/users/users.component";
import {UnitComponent} from "@/_components/admin/unit/unit.component";

const dashboardRoutes: Routes = [
    {
        path: "",
        component: DashboardComponent,
        children: [
            {path: "", loadChildren: "./category/category.module.ts#CategoryModule"},
            {
                path: 'order', children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./order/order.module').then(m => m.OrderModule)
                        },
                    ]
            },
            {
                path: 'deliveryBoy', children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./deliveryBoy/deliveryBoy.module').then(m => m.DeliveryBoyModule)
                        },
                    ]
            },
            {
                path: 'merchant', children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./merchant/merchant.module').then(m => m.MerchantModule)
                        },
                    ]
            },
            {path: 'user', component: UsersComponent},
            {path: 'unit', component: UnitComponent}
        ],
    },
];

export const DashboardRouting = RouterModule.forChild(dashboardRoutes);
