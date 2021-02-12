import {NgModule} from "@angular/core";
import {Pagination} from "./pagination/pagination.component";
import {DatatableComponent} from "./datatable/datatable";
import {CommonModule} from "@angular/common";
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";
import {TimepickerModule} from "ngx-bootstrap/timepicker";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
} from "@angular/material";
import {PaginationModule} from "ngx-bootstrap/pagination";
import {NgxMaskModule, IConfig} from "ngx-mask";
import {OfferImageEditComponent} from "@/_components/common/offer-Image-add/offer.image.edit.component";
import {DeleteModelComponent} from "@/_components/common/model/delete-model/delete.model.component";
import {UpdateMerchantComponent} from "@/_components/common/model/update-merchant-item/update.merchant.component";
import {RouterModule} from "@angular/router";
import {ModalModule} from "ngx-bootstrap/modal";
import {ConformModelComponent} from "@/_components/common/model/conform-model/conform.model.component";
import {NotificationComponent} from "@/_components/common/notification/notification.component";
import {AdminSidebarComponent} from "@/_components/common/sidebar/admin/admin.sidebar.component";
import {MerchantSidebarComponent} from "@/_components/common/sidebar/merchant/merchant.sidebar.component";
import {ClickOutsideModule} from "ng-click-outside";
import {SearchTextComponent} from "@/_components/common/search-text/search.text.component";
import {AddMerchantCategoryComponent} from "@/_components/common/add-merchant-category/add.merchant.category.component";
import {AddMerchantItemComponent} from "@/_components/common/add-merchant-item/add.merchant.item.component";
import {ViewMerchantItemComponent} from "@/_components/common/view-merchant-item/view.merchant.item.component";
import {ViewMerchantCategoryComponent} from "@/_components/common/view-merchant-category/view.merchant.category.component";
import {ViewMerchantProfileComponent} from "@/_components/common/view-merchant-profile/view.merchant.profile.component";

const maskConfig: Partial<IConfig> = {
    validation: false,
};

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatIconModule,
        MatFormFieldModule,
        PaginationModule.forRoot(),
        NgxMaskModule.forRoot(maskConfig),
        TimepickerModule.forRoot(),
        NgxMaskModule.forRoot(maskConfig),
        BsDatepickerModule.forRoot(),
        RouterModule,
        ClickOutsideModule,
        ModalModule.forRoot()
    ],
    entryComponents: [DeleteModelComponent, UpdateMerchantComponent, ConformModelComponent],
    declarations: [
        Pagination,
        DatatableComponent,
        DeleteModelComponent,
        OfferImageEditComponent,
        UpdateMerchantComponent,
        ConformModelComponent,
        NotificationComponent,
        AdminSidebarComponent,
        MerchantSidebarComponent,
        SearchTextComponent,
        AddMerchantCategoryComponent,
        AddMerchantItemComponent,
        ViewMerchantItemComponent,
        ViewMerchantCategoryComponent,
        ViewMerchantProfileComponent
    ],
    exports: [
        Pagination,
        DatatableComponent,
        UpdateMerchantComponent,
        DeleteModelComponent,
        OfferImageEditComponent,
        ConformModelComponent,
        NotificationComponent,
        SearchTextComponent,
        AddMerchantCategoryComponent,
        AddMerchantItemComponent,
        ViewMerchantItemComponent,
        ViewMerchantCategoryComponent,
        ViewMerchantProfileComponent
    ],
})
export class DashboardCommonModule {
}
