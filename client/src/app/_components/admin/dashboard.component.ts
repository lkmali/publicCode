import {Component, OnInit} from '@angular/core';
import {AuthenticationService, MessagingService} from "@/_services";
import {ActivatedRoute, Router} from "@angular/router";
import {PushNotificationService} from "@/_services/push.notification.service";

@Component({templateUrl: 'dashboard.component.html'})
export class DashboardComponent implements OnInit {

    constructor(private pushNotificationService: PushNotificationService, private authenticationService: AuthenticationService, private route: ActivatedRoute, private router: Router, private messagingService: MessagingService) {
    }

    ngOnInit() {
    }
}
