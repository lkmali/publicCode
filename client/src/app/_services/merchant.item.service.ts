import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthStorage} from "@/_services/authentication.service";

@Injectable()
export class MerchantItemService {


    authStorage = new AuthStorage();
    baseUrl = `${config.api.base}${config.api.merchantItem}`;

    constructor(private http: HttpClient) {

    }

    getMerchantItems(filter) {
        let url = `${this.baseUrl}/${this.authStorage.getRole()}?offset=${filter.offset}&limit=${filter.limit}&searchText=${filter.searchText}`;
        if (filter.categoryId) {
            url = `${url}&categoryId=${filter.categoryId}`;
        }
        url = `${url}&merchantId=${this.authStorage.getMerchantId()}`;
        return this.http.get<any>(url);
    }

    addMerchantItems(request: any) {
        request["merchantId"] = this.authStorage.getMerchantId();
        return this.http.post<any>(`${this.baseUrl}/${this.authStorage.getRole()}`, request);
    }

    getUnselectedMerchantItem(filter) {
        let url = `${this.baseUrl}/unselected/${this.authStorage.getRole()}?offset=${filter.offset}&limit=${filter.limit}&searchText=${filter.searchText}`;
        if (filter.categoryId) {
            url = `${url}&categoryId=${filter.categoryId}`;
        }
        if (filter.merchantId) {
            url = `${url}&merchantId=${this.authStorage.getMerchantId()}`;
        }
        return this.http.get<any>(url);
    }

    updateMerchantItems(body) {
        body["merchantId"] = this.authStorage.getMerchantId();
        return this.http.put<any>(`${this.baseUrl}/${this.authStorage.getRole()}`, body);
    }

    updateMerchantItemsPrice(body) {
        body["merchantId"] = this.authStorage.getMerchantId();
        return this.http.put<any>(`${this.baseUrl}/${this.authStorage.getRole()}/price`, body);
    }

    deleteMerchantItems(request: any) {
        request["merchantId"] = this.authStorage.getMerchantId();
        return this.http.put<any>(`${this.baseUrl}/delete/${this.authStorage.getRole()}`, request);
    }
}
