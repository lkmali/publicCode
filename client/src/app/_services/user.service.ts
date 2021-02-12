import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class UserService {
    baseUrl = `${config.api.base}${config.api.user}`;

    constructor(private http: HttpClient) {
    }

    getUser(offset, limit, searchText) {
        return this.http.get<any>(`${this.baseUrl}/?offset=${offset}&limit=${limit}&searchText=${searchText}`);
    }

    action(action, phone) {
        return this.http.put<any>(`${this.baseUrl}/active/${action}`, {phone: phone});
    }
}