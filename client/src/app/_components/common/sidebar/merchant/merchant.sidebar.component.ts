import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {AuthenticationService} from "@/_services";

@Component({
    selector: "app-merchant-sidebar",
    templateUrl: "merchant.sidebar.component.html",
})
export class MerchantSidebarComponent implements OnInit {
    role: any = "";

    constructor(private router: Router, private authenticationService: AuthenticationService) {
        router.events.subscribe((val) => {
        });
    }

    ngOnInit() {
        let user = this.authenticationService.getAuthData();
        if (user) {
            this.role = user.role
        }
    }

    logout() {
        this.authenticationService.logout();
    }
}
