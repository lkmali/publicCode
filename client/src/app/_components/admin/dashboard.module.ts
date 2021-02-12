import {NgModule} from "@angular/core";
import {DashboardRouting} from "./dashboard.route";
// RECOMMENDED
import {DashboardComponent} from "./dashboard.component";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UsersComponent} from "@/_components/admin/users/users.component";
import {DashboardCommonModule} from "@/_components/common/common.module";
import {UnitComponent} from "@/_components/admin/unit/unit.component";
import {AddUnitComponent} from "@/_components/admin/unit/add-unit/add.unit.component";

@NgModule({
    imports: [DashboardRouting, CommonModule, FormsModule, ReactiveFormsModule, DashboardCommonModule],
    declarations: [DashboardComponent, UsersComponent, UnitComponent, AddUnitComponent],
    entryComponents: [AddUnitComponent],
    bootstrap: [DashboardComponent],
})
export class DashboardModule {
}
