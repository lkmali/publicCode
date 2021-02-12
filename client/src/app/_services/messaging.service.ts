import {Injectable} from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFireMessaging} from '@angular/fire/messaging';
import {mergeMapTo} from 'rxjs/operators';
import {take} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs'
import {HttpClient} from '@angular/common/http';

@Injectable()
export class MessagingService {
    baseUrl = `${config.api.base}${config.api.user}`;
    currentMessage = new BehaviorSubject(null);

    constructor(
        private angularFireDB: AngularFireDatabase,
        private http: HttpClient,
        private angularFireAuth: AngularFireAuth,
        private angularFireMessaging: AngularFireMessaging) {
        this.angularFireMessaging.messaging.subscribe(
            (_messaging) => {
                _messaging.onMessage = _messaging.onMessage.bind(_messaging);
                _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
            }
        )
    }

    /**
     * update token in firebase database
     *
     * @param userId userId as a key
     * @param token token as a value
     */
    updateToken(userId, token) {
        // we can change this function to request our backend service
        this.angularFireAuth.authState.pipe(take(1)).subscribe(
            () => {
                const data = {};
                data[userId] = token;
                this.angularFireDB.object('fcmTokens/').update(data);
                this.updateTokenInBackend(token);
            });
    }


    /**
     * update token in firebase database
     *
     * @param token token as a value
     */
    updateTokenInBackend(token) {
        return this.http.put<any>(`${this.baseUrl}/fcm`, {token: token, type: "WEB"}).subscribe(result => {
            console.log("updateTokenInBackend-->result")
        }, (err) => {
            console.log("updateTokenInBackend-->err", err)
        });
    }


    /**
     * request permission for notification from firebase cloud messaging
     *
     * @param userId userId
     */
    requestPermission(userId) {
        this.angularFireMessaging.requestToken.subscribe(
            (token) => {
                console.log(token);
                this.updateToken(userId, token);
            },
            (err) => {
                console.error('Unable to get permission to notify.', err);
            }
        );
    }

    /**
     * hook method when new notification received in foreground
     */
    receiveMessage() {
        return this.angularFireMessaging.messages;
    }
}
