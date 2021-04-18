import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

const baseUrl = 'http://192.168.2.2:8080/api/violations'

@Injectable({
  providedIn: 'root'
})
export class DistViolationsService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get(baseUrl);
  }

  getLastDay() {
    return this.http.get(baseUrl + '/getLastDay');
  }
}
