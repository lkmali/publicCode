import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class CategoryService {
    baseUrl = `${config.api.base}${config.api.category}`;

    constructor(private http: HttpClient) {

    }

    save(request: any) {
        return this.http.post<any>(this.baseUrl, request);
    }

    uploadFile(request: any) {
        return this.http.post<any>(`${this.baseUrl}/file`, request);
    }

    get(limit, offset, searchText) {
        return this.http.get<any>(`${this.baseUrl}/admin?offset=${offset}&limit=${limit}&searchText=${searchText}`);
    }

    getById(id) {
        return this.http.get<any>(`${this.baseUrl}/admin?id=${id}`);
    }

    action(action, id) {
        return this.http.put<any>(`${this.baseUrl}/active/${action}`, {id: id});
    }

    update(id: string, request: any) {
        return this.http.put<any>(`${this.baseUrl}/${id}`, request);
    }
}
