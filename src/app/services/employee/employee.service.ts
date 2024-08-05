import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Interface } from 'readline';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'

})
export class EmployeeService {

  url: string = 'http://localhost:8080/employees';

  constructor(private http: HttpClient) { }

  getEmployees() {
    return this.http.get(this.url);
  }

  getEmployeeDetail(id: number): Observable<any> {
    return this.http.get(this.url + '/details/' + id);
  }

  getAllReferents(): Observable<any> {
    return this.http.get(this.url + '/referents');
  }

  postEmployee(employee: any) : Observable<any> {
    return this.http.post(this.url, employee);
  }

  putEmployee(employee: any, id: number) : Observable<any> {
    return this.http.put(this.url + '/' + id, employee);
  }

  deleteEmployee(id: number) : Observable<any> {
    return this.http.delete(this.url + '/' + id);
  }

  activateEmployee(id: number) : Observable<any> {
    return this.http.put(this.url + '/' + id + '/activate', null);
  }

  getRegistrationReport(startDate: String, endDate: String, unit: String): Record<string, number> {
    if (unit == "MONTH") {
      return {
        Enero: 10,
        Febrero: 20,
        Marzo: 32,
        Abril: 15,
        Mayo: 25,
        Junio: 30,
        Julio: 10,
        Agosto: 20,
        Septiembre: 32, 
        Octubre: 15,
        Noviembre: 25,
        Diciembre: 30    
      }
    }
    if (unit == "DAY") {
      return {
        Lunes: 10,
        Martes: 20,
        Miercoles: 32,
        Jueves: 15,
        Viernes: 25,
        Sabado: 30,
        Domingo: 10
      }
    }
    if (unit == "WEEK") {
      return {
        "Semana 1": 10,
        "Semana 2": 20,
        "Semana 3": 32,
        "Semana 4": 15,
        "Semana 5": 25
      }
    }
    return {
      2012: 10,
      2013: 20,
      2014: 32,
      2015: 15,
      2016: 25,
      2017: 30,
      2018: 10,
      2019: 20,
      2020: 32, 
      2021: 15,
      2022: 25,
      2023: 30
  }
}
}
