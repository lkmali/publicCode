import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class MerchantCartService {
    baseUrl = `${config.api.base}${config.api.merchantCart}`;

    constructor(private http: HttpClient) {

    }

    addMerchantCart(request: any) {
        return this.http.post<any>(this.baseUrl, request);
    }

    updateMerchantByAdmin(request: any) {
        return this.http.put<any>(`${this.baseUrl}/admin/`, request);
    }

    updateMerchantCartByMerchant(request: any) {
        return this.http.put<any>(`${this.baseUrl}/merchant/`, request);
    }

    getMerchantCartByMerchant(orderId) {
        return this.http.get<any>(`${this.baseUrl}/admin/${orderId}`);
    }

    getPendingOrder(orderId = null) {
        let url = `${this.baseUrl}/merchant`;
        if (orderId) {
            url = `${url}?orderId=${orderId}`;
        }
        return this.http.get<any>(url);
    }

    conformAllItemByMerchant(request) {
        return this.http.put<any>(`${this.baseUrl}/conform`, request);
    }
}
