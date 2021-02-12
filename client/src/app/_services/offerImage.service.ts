import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class OfferImageService {
    baseUrl = `${config.api.base}${config.api.offerImage}`;

    constructor(private http: HttpClient) {

    }

    addOfferImage(request: any) {
        return this.http.post<any>(this.baseUrl, request);
    }

    getOfferImageByAdmin(offset, limit, searchText, categoryId) {
        return this.http.get<any>(`${this.baseUrl}/admin?offset=${offset}&limit=${limit}&categoryId=${categoryId}&searchText=${searchText}`);
    }

    getById(id) {
        return this.http.get<any>(`${this.baseUrl}/admin?id=${id}`);
    }
    getByItemId(id) {
        return this.http.get<any>(`${this.baseUrl}/admin?item=${id}`);
    }

    offerImageAction(action, id) {
        return this.http.put<any>(`${this.baseUrl}/active/${action}`, {id: id});
    }

    deleteOfferImage(id) {
        return this.http.delete<any>(`${this.baseUrl}/${id}`);
    }
}