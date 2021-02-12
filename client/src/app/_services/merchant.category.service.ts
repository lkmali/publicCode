import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthStorage} from "@/_services/authentication.service";

@Injectable()
export class MerchantCategoryService {
    authStorage = new AuthStorage();
    baseUrl = `${config.api.base}${config.api.merchantCategory}`;

    constructor(private http: HttpClient) {

    }

    getMerchantCategories(filter) {
        return this.http.get<any>(`${this.baseUrl}/${this.authStorage.getRole()}?offset=${filter.offset}&limit=${filter.limit}&searchText=${filter.searchText}&merchantId=${this.authStorage.getMerchantId()}`);
    }

    addMerchantCategories(request: any) {
        request["merchantId"] = this.authStorage.getMerchantId();
        return this.http.post<any>(`${this.baseUrl}/${this.authStorage.getRole()}`, request);
    }

    updateMerchantCategories(body) {
        body["merchantId"] = this.authStorage.getMerchantId();
        return this.http.put<any>(`${this.baseUrl}/${this.authStorage.getRole()}`, body);
    }

    deleteMerchantCategories(request: any) {
        request["merchantId"] = this.authStorage.getMerchantId();
        return this.http.put<any>(`${this.baseUrl}/delete/${this.authStorage.getRole()}`, request);
    }

    getUnselectedMerchantCategories(filter) {
        return this.http.get<any>(`${this.baseUrl}/unselected/${this.authStorage.getRole()}?offset=${filter.offset}&limit=${filter.limit}&searchText=${filter.searchText}&merchantId=${this.authStorage.getMerchantId()}`);
    }
}
