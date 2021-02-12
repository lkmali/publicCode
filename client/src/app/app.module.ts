import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {NotifierModule, NotifierOptions} from 'angular-notifier';
import {AngularFireMessagingModule} from '@angular/fire/messaging';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// used to create fake backend

import {AppComponent} from './app.component';
import {routing} from './app.routing';
import {
    AlertService,
    AuthenticationService,
    UserService,
    ItemService,
    CategoryService,
    MessagingService,
    DeliveryBoyService,
    MerchantItemService,
    MerchantCategoryService,
    AuthInterceptor, AuthGuard, AdminGuard, MerchantGuard
} from './_services';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AsyncPipe, DatePipe} from '@angular/common';
import {LoginComponent} from "@/_components/login/login.component";
import {AngularFireAuthModule} from "@angular/fire/auth";
import {AngularFireModule} from "@angular/fire";
import {MerchantService} from "@/_services/merchant.service";
import {DistanceService} from "@/_services/distance.service";
import {OfferImageService} from "@/_services/offerImage.service";
import {OrderDeliveryService} from "@/_services/order.delivery.service";
import {MerchantCartService} from "@/_services/merchant.cart.service";
import {PushNotificationService} from "@/_services/push.notification.service";
import {VerifyOtpComponent} from "@/_components/verify-otp/verify.otp.component";
import {UnitService} from "@/_services/unit.service";
import {EventService} from "@/_services/event.service";

const customNotifierOptions: NotifierOptions = {
    position: {
        horizontal: {
            position: 'right',
            distance: 12
        },
        vertical: {
            position: 'top',
            distance: 12,
            gap: 10
        }
    },
    theme: 'material',
    behaviour: {
        autoHide: 5000,
        onClick: 'hide',
        onMouseover: 'pauseAutoHide',
        showDismissButton: true,
        stacking: 4
    },
    animations: {
        enabled: true,
        show: {
            preset: 'slide',
            speed: 300,
            easing: 'ease'
        },
        hide: {
            preset: 'fade',
            speed: 300,
            easing: 'ease',
            offset: 50
        },
        shift: {
            speed: 300,
            easing: 'ease'
        },
        overlap: 150
    }
};

@NgModule({
    imports: [
        BrowserModule,
        ReactiveFormsModule,
        HttpClientModule,
        routing,
        BrowserAnimationsModule,
        FormsModule,
        NotifierModule.withConfig(customNotifierOptions),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        AngularFireMessagingModule,
        AngularFireModule.initializeApp(config.firebase)
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        VerifyOtpComponent
    ],

    providers: [
        AlertService,
        AuthenticationService,
        CategoryService,
        ItemService,
        UserService,
        DatePipe,
        MerchantService,
        DeliveryBoyService,
        DistanceService,
        MessagingService,
        AsyncPipe,
        OfferImageService,
        MerchantCategoryService,
        MerchantItemService,
        OrderDeliveryService,
        MerchantCartService,
        EventService,
        PushNotificationService,
        UnitService,
        AuthGuard, AdminGuard, MerchantGuard, AlertService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        }
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
