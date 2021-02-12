import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from "@/_components/login/login.component";
import {AdminGuard, MerchantGuard} from "@/_services";
import {VerifyOtpComponent} from "@/_components/verify-otp/verify.otp.component";

const appRoutes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: "verify/:phone", component: VerifyOtpComponent},
    {
        path: 'admin', canActivate: [AdminGuard], children:
            [
                {
                    path: '',
                    loadChildren: () => import('./_components/admin/dashboard.module').then(m => m.DashboardModule)
                },
            ]
    },
    {
        path: 'merchant', canActivate: [MerchantGuard], children:
            [
                {
                    path: '',
                    loadChildren: () => import('./_components/merchant/merchant.dashboard.module').then(m => m.MerchantDashboardModule)
                },
            ]
    },
    {path: "**", redirectTo: "login"}
];

export const routing = RouterModule.forRoot(appRoutes);
