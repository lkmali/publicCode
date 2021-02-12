import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {first} from 'rxjs/operators';

import {AlertService, AuthenticationService} from '../../_services';

@Component({templateUrl: 'verify.otp.component.html'})
export class VerifyOtpComponent implements OnInit {
    loading = false;
    submitted = false;
    verifyCode = "";
    authService: any;
    phone: string = "";
    returnUrl = "";

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService) {
        if (this.authenticationService.isAuthorized())
            this.router.navigate([this.authenticationService.getRootPath()]);
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            if (params["phone"]) {
                this.phone = params["phone"];
            }
        });
    }

    onVerifyCode() {
        if (this.verifyCode.length === 6) {
            this.submitted = true;
        }
    }

    onSubmit() {

        this.loading = true;
        this.submitted = false;
        this.authService = this.authenticationService.verifyPhone(this.phone, this.verifyCode)
            .pipe(first())
            .subscribe(
                data => {
                    this.loading = false;
                    if (data && data['success'] && data['data']) {
                        if (data['data']["role"] === 'merchant') {
                            this.returnUrl = "/merchant";
                            this.router.navigate([this.returnUrl]);
                        } else if (data['data']["role"] === 'admin') {
                            this.returnUrl = "/admin";
                            this.router.navigate([this.returnUrl]);
                        } else {
                            this.authenticationService.logout();
                        }
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
