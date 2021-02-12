import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ItemService {
    baseUrl = `${config.api.base}${config.api.item}`;

    constructor(private http: HttpClient) {

    }

    save(request: any) {
        return this.http.post<any>(this.baseUrl, request);
    }

    saveItemImage(id: string, request: any) {
        return this.http.put<any>(`${this.baseUrl}/images/${id}`, request);
    }

    getItem(offset, limit, searchText, categoryId) {
        return this.http.get<any>(`${this.baseUrl}/admin?offset=${offset}&limit=${limit}&categoryId=${categoryId}&searchText=${searchText}`);
    }

    getById(id) {
        return this.http.get<any>(`${this.baseUrl}/admin?id=${id}`);
    }

    getActiveItem(offset, limit, searchText, categoryId) {
        return this.http.get<any>(`${this.baseUrl}?offset=${offset}&limit=${limit}&categoryId=${categoryId}&searchText=${searchText}`);
    }

    action(action, id) {
        return this.http.put<any>(`${this.baseUrl}/active/${action}`, {id: id});
    }

    UpdateAllItem(data) {
        return this.http.put<any>(`${this.baseUrl}`, data);
    }

    stockAction(action, id) {
        return this.http.put<any>(`${this.baseUrl}/stock/${action}`, {id: id});
    }

    update(id: string, request: any) {
        return this.http.put<any>(`${this.baseUrl}/${id}`, request);
    }
}