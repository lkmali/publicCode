import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class OrderService {
    baseUrl = `${config.api.base}${config.api.order}`;

    constructor(private http: HttpClient) {

    }


    getOrder(offset, limit, status = null) {

        let url = `${this.baseUrl}/admin?offset=${offset}&limit=${limit}`;
        if (!status || status !== "All") {
            url = `${url}&status=${status}`
        }
        return this.http.get<any>(url);
    }

    getById(id) {
        return this.http.get<any>(`${this.baseUrl}/admin?id=${id}`);
    }

    getHeaders() {
        const headerDict = {'Accept': 'application/pdf'};
        return {headers: new HttpHeaders(headerDict)};
    }

    downloadAdminOrderInvoice(id, config) {
        return this.http.get<any>(`${this.baseUrl}/admin/invoice/${id}`, config);
    }

    action(action, id) {
        return this.http.put<any>(`${this.baseUrl}/active/${action}`, {id: id});
    }

    deliveredOrder(id, status) {
        return this.http.put<any>(`${this.baseUrl}/status/${id}`, {status: status});
    }

    sendMessage(body) {
        return this.http.post<any>(`${this.baseUrl}/message`, body);
    }
}