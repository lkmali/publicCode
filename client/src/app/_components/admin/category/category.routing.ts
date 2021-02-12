import {RouterModule, Routes} from "@angular/router";
import {CategoryComponent} from "@/_components/admin/category/category.component";
import {CreateCategoryComponent} from "@/_components/admin/category/create-category/create-category.component";
import {ItemComponent} from "@/_components/admin/category/item/item.component";
import {EditItemComponent} from "@/_components/admin/category/item/edit-item/edit-item.component";
import {CreateItemComponent} from "@/_components/admin/category/item/create-item/create-item.component";

const categoryRoute: Routes = [
    {path: "", component: CategoryComponent},
    {
        path: "create",
        component: CreateCategoryComponent
    },
    {
        path: "item",
        component: ItemComponent
    },
    {
        path: "edit/:id",
        component: CreateCategoryComponent
    },
    {
        path: "item/edit/:id",
        component: EditItemComponent
    },
    {
        path: "item/create/:id",
        component: CreateItemComponent
    },
    {
        path: "item/:id",
        component: ItemComponent
    },


    {
        path: "",
        component: CategoryComponent
    },
];
export const CategoryRouting = RouterModule.forChild(categoryRoute);
