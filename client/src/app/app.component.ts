import {Component, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {AlertService, AuthenticationService} from './_services';
import {NotifierService} from "angular-notifier";

@Component({
    selector: 'app',
    templateUrl: 'app.component.html'
})

export class AppComponent {
    constructor(private alertService: AlertService, private notifier: NotifierService) {}
    ngOnInit() {
        this.alertService.getMessage().subscribe(message => {
            if (message) {
                this.notifier.notify(message.type, message.text);
            }
        });
    }
}
