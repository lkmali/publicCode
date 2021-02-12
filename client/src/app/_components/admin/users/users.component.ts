import {Component, OnInit} from '@angular/core';
import {AlertService, AuthenticationService, UserService} from "@/_services";
import {Subscription} from "rxjs";

@Component({templateUrl: 'users.component.html'})
export class UsersComponent implements OnInit {
    users: any[] = [];
    activation = {
        false: "deactivate",
        true: "activate"
    };
    private _subs: Subscription;
    userData: any = {};
    filter: { pageIndex: number; pageSize: number; offset: number; };
    totalItems: any = 0;
    searchText = "";

    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private alertService: AlertService) {
    }

    ngOnInit() {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        this.getOrgUser();
    }

    pageChanged(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = parseInt(filter.pageSize);
        this.filter.pageIndex = filter.pageIndex;
        this.getOrgUser();
    }

    gettingUsers = true;

    getOrgUser() {
        this.gettingUsers = true;
        this._subs = this.userService.getUser(this.filter.offset, this.filter.pageSize, this.searchText).subscribe(result => {
            if (result && result['success'] && result['data']) {
                this.users = result.data.records;
                this.totalItems = result.data.total;
            } else if (result && result.hasOwnProperty("error")) {
                this.alertService.error(result.error.message || result.error);
            }
            this.gettingUsers = false;
        }, (err) => {
            this.gettingUsers = false;
            this.alertService.error(err["message"] || err);
        });
    }

    onSearch(event) {
        this.filter = {pageIndex: 1, pageSize: 10, offset: 0};
        if (this.searchText.length >= 2) {
            this.getOrgUser();
        }
        if (!this.searchText) {
            this.getOrgUser();
        }
    }

    UserAction(data) {
        this._subs = this.userService.action(this.activation[data.isDeleted], data.phone).subscribe(data => {
            if (data['success']) {
                this.alertService.success(this.userData.isDeleted ? "User activated successfully" : "User deactivated successfully");
                this.getOrgUser();
            } else if (data['error']) {
                this.alertService.error(data['error']['message']);
            }
        }, (err) => {
            this.alertService.error(err["message"] || err);
        });
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this._subs.unsubscribe();

    }

}
