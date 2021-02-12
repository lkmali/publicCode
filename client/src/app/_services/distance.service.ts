import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class DistanceService {
    baseUrl = `${config.api.base}${config.api.distance}`;

    constructor(private http: HttpClient) {

    }

    getDeliveryBoyDistance(orderId) {
        return this.http.get<any>(`${this.baseUrl}/deliveryBoy/${orderId}`);
    }
    getMerchantDistance(orderId: any) {
        return this.http.get<any>(`${this.baseUrl}/merchant/${orderId}`);
    }

    getMerchantDistanceWithItem(orderId: any) {
        return this.http.get<any>(`${this.baseUrl}/order/merchant/${orderId}`);
    }
}
