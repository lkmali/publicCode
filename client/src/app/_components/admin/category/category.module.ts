import {NgModule} from "@angular/core";
import {DashboardCommonModule} from "../../common/common.module";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";
import {CategoryRouting} from "./category.routing";
import {CreateCategoryComponent} from "@/_components/admin/category/create-category/create-category.component";
import {CategoryComponent} from "@/_components/admin/category/category.component";
import {ItemComponent} from "@/_components/admin/category/item/item.component";
import {EditItemComponent} from "@/_components/admin/category/item/edit-item/edit-item.component";
import {ExtraPropertyComponent} from "@/_components/admin/category/item/edit-item/extra-property/extra-property.component";
import {CreateItemComponent} from "@/_components/admin/category/item/create-item/create-item.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DashboardCommonModule,
        BsDatepickerModule.forRoot(),
        CategoryRouting
    ],
    declarations: [CreateCategoryComponent, CreateItemComponent, CategoryComponent, ItemComponent, EditItemComponent, ExtraPropertyComponent],
    exports: [],
})
export class CategoryModule {
}
