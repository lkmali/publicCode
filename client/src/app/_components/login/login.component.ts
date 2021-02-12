import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {first} from 'rxjs/operators';

import {AlertService, AuthenticationService} from '../../_services';

@Component({templateUrl: 'login.component.html'})
export class LoginComponent implements OnInit {
    loading = false;
    submitted = false;
    authService: any;
    phone: string = "";
    gettingPage = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService) {
        if (this.authenticationService.isAuthorized()) {
            this.gettingPage = false;
            this.router.navigate([this.authenticationService.getRootPath()]);
        }
    }

    ngOnInit() {
        this.gettingPage = false;
    }

    onPhone() {
        console.log("Phone", this.phone);
        if (this.phone.length === 10) {
            this.submitted = true;
        }
    }

    onSubmit() {
        this.loading = true;
        this.submitted = false;
        this.authService = this.authenticationService.sendOtp(this.phone)
            .pipe(first())
            .subscribe(
                data => {
                    this.loading = false;
                    if (data && data['success'] && data['data']) {
                        this.router.navigate([`verify/${this.phone}`]);
                    } else if (data && data.hasOwnProperty("error")) {
                        this.alertService.error(data.error.message || data.error);
                    } else {
                    }
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });
    }
}
