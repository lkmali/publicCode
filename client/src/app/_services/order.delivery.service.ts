import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class OrderDeliveryService {
    baseUrl = `${config.api.base}${config.api.orderDelivery}`;

    constructor(private http: HttpClient) {

    }

    createOrderDelivery(request: any) {
        return this.http.post<any>(this.baseUrl, request);
    }

    conformOrderDelivery(request: any) {
        return this.http.put<any>(this.baseUrl, request);
    }

    orderDeliverySuccessfully(request: any) {
        return this.http.put<any>(`${this.baseUrl}/admin/delivered`, request);
    }

    getOrderDelivery(orderId) {
        return this.http.get<any>(`${this.baseUrl}/admin/${orderId}`);
    }

    getConformedOrder(id = null) {
        let url = `${this.baseUrl}/merchant`;
        if (id) {
            url = `${url}?id=${id}`;
        }
        return this.http.get<any>(url);
    }
}
