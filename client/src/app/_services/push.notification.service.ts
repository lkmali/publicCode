import {Injectable} from '@angular/core';
import {Observable} from "rxjs";

@Injectable()
export class PushNotificationService {
    public permission: any;
​

    constructor() {
        this.permission = this.isSupported() ? 'default' : 'denied';

    }

​

    public isSupported(): boolean {

        return 'Notification' in window;

    }

    requestPermission(): void {
        let self = this;

        if ('Notification' in window) {

            Notification.requestPermission(function (status) {
                return self.permission = status;

            });

        }
    }

    create(title: string, options ?: any): any {
        let self = this;
        console.log("payload.data", options);
        console.log("self.permission", self.permission);
        return new Observable(function (obs) {
            if (!('Notification' in window)) {
                console.log('Notifications are not available in this environment');
                obs.complete();
            }

            let _notify = new Notification(title, options);
            console.log("_notify", _notify);
            _notify.onshow = function (e) {
                return obs.next({});
            };

            _notify.onclick = function (e) {
                console.log("e", e);
                return obs.next(options);
            };

            _notify.onerror = function (e) {

                return obs.error({notification: _notify, event: e})
            };

            _notify.onclose = function () {

                return obs.complete();

            };

        });

    }

}