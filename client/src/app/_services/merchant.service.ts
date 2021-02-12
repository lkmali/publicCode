import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthStorage} from "@/_services/authentication.service";

@Injectable()
export class MerchantService {
    baseUrl = `${config.api.base}${config.api.merchant}`;
    userBaseUrl = `${config.api.base}${config.api.user}`;
    authStorage = new AuthStorage();

    constructor(private http: HttpClient) {

    }

    AddMerchant(request: any) {
        return this.http.post<any>(`${this.userBaseUrl}/details`, request);
    }

    uploadFile(request: any) {
        return this.http.post<any>(`${this.baseUrl}/file`, request);
    }

    getMerchantByAdmin(limit, offset, searchText) {
        return this.http.get<any>(`${this.baseUrl}/admin?offset=${offset}&limit=${limit}&searchText=${searchText}`);
    }

    getById() {
        if (this.authStorage.getRole() === 'admin') {
            return this.http.get<any>(`${this.baseUrl}/admin?id=${this.authStorage.getMerchantId()}`);
        } else {
            return this.http.get<any>(`${this.userBaseUrl}/details`);
        }

    }

    merchantAction(action, id) {
        return this.http.put<any>(`${this.baseUrl}/active/${action}`, {id: id});
    }

    updateMerchant(id: string, request: any) {
        return this.http.put<any>(`${this.baseUrl}/${id}`, request);
    }

    sendFinalItemOrderToMerchant(request: any) {
        return this.http.post<any>(`${this.baseUrl}/send/order`, request);
    }

    deleteMerchant(id: string) {
        return this.http.delete<any>(`${this.baseUrl}/${id}`);
    }
}
