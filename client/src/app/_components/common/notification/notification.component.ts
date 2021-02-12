import {Component, OnInit} from '@angular/core';
import {AuthenticationService, EventService, MessagingService, PushNotificationService} from "@/_services";
import {ActivatedRoute, Router} from "@angular/router";


@Component({templateUrl: 'notification.component.html', selector: 'app-notification',})
export class NotificationComponent implements OnInit {

    constructor(private broadcaster: EventService, private pushNotificationService: PushNotificationService, private authenticationService: AuthenticationService, private route: ActivatedRoute, private router: Router, private messagingService: MessagingService) {
    }

    count = 0;
    notificationList: any [] = [];
    showNotification: boolean;
    message;
    role = '';
    title: string = "";
    body: string = "";
    status: boolean = false;
    status_icon: boolean = false;
    openMenu: boolean = false;

    ngOnInit() {
        let user = this.authenticationService.getAuthData();
        if (user) {
            this.getUnReadNotification();
            this.getNotification();
            const userId = user.phone;
            this.role = user.role;
            console.log("userIduserIduserIduserId", userId);
            this.messagingService.requestPermission(userId);
            this.messagingService.receiveMessage().subscribe(
                (payload: any) => {
                    console.log("new message received. ", payload.data);
                    this.addNotification({
                        title: payload.data.title,
                        link: payload.data.link,
                        body: payload.data.body
                    });
                    this.broadcaster.BroadcastEvent(payload.data.event, payload);
                    this.createNotification(payload.data);
                });
            this.message = this.messagingService.currentMessage;
            console.log("this.message", this.message);
        } else {
            this.authenticationService.logout();
        }

    }

    getNotification() {
        this.notificationList = this.authenticationService.getNotification();
    }

    getUnReadNotification() {
        this.getNotification();
        var counter = 0;
        for (let index = 0; index < this.notificationList.length; index++) {
            if (!this.notificationList[index].read) {
                counter++;
            }

        }
        this.count = counter;
    }

    addNotification(data) {
        this.notificationList.push(data);
        this.authenticationService.setNotification(this.notificationList);
        this.getUnReadNotification();
    }

    closeNotification(index) {
        this.notificationList.splice(index, 1);
        this.authenticationService.setNotification(this.notificationList);
        this.getUnReadNotification();

    }

    createNotification(data) {
        this.pushNotificationService.create(data.title, data).subscribe(
            (payload: any) => {
                if (payload.body) {
                    window.open(payload.body, "_self");
                }
                console.log("createNotification.message", payload);
            });

    }

    openNotification(state: boolean, event) {
        console.log("Event", event.target.id);
        if (event && event.target && event.target.id === "deleteNotification") {
            return;
        }
        this.showNotification = state;
        for (let index = 0; index < this.notificationList.length; index++) {
            this.notificationList[index]["read"] = true;

        }
        this.authenticationService.setNotification(this.notificationList);
        this.getUnReadNotification();
    }

    menuToggle() {
        this.openMenu = !this.openMenu;
        this.status_icon = !this.status_icon;
    }

    slidebar() {
        this.status = !this.status;
        this.status_icon = !this.status_icon;
    }
}
