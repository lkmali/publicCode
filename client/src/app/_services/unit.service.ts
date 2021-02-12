import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class UnitService {
    baseUrl = `${config.api.base}${config.api.unit}`;

    constructor(private http: HttpClient) {

    }

    saveUnit(request: any) {
        return this.http.post<any>(this.baseUrl, request);
    }

    getUnit() {
        return this.http.get<any>(`${this.baseUrl}`);
    }

    deleteUnit(name) {
        return this.http.delete<any>(`${this.baseUrl}/${name}`);
    }
}