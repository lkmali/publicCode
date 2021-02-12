import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class DeliveryBoyService {
    baseUrl = `${config.api.base}${config.api.deliveryBoy}`;

    constructor(private http: HttpClient) {

    }

    AddDeliveryBoy(request: any) {
        return this.http.post<any>(this.baseUrl, request);
    }
    uploadFile(request: any) {
        return this.http.post<any>(`${this.baseUrl}/file`, request);
    }

    getDeliveryBoyByAdmin(limit, offset, searchText) {
        return this.http.get<any>(`${this.baseUrl}?offset=${offset}&limit=${limit}&searchText=${searchText}`);
    }

    getById(id) {
        return this.http.get<any>(`${this.baseUrl}?id=${id}`);
    }

    deliveryBoyAction(action, id) {
        return this.http.put<any>(`${this.baseUrl}/active/${action}`, {id: id});
    }

    updateDeliveryBoy(id: string, request: any) {
        return this.http.put<any>(`${this.baseUrl}/${id}`, request);
    }

    deleteDeliveryBoy(id: string) {
        return this.http.delete<any>(`${this.baseUrl}/${id}`);
    }
}