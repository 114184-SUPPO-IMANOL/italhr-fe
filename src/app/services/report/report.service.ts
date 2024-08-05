import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { get } from 'node:http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  url: string = "http://localhost:8080"
  report: string = "/reports"
  employee: string = "/employees"
  department: string = "/departments"
  workstations: string = "/workstations"
  integrations: string = "/integrations"
  deleted: string = "/deleted"

  hardCodedActive: boolean = true;
  hardCodedMapping: string = "/hardcoded"

  constructor(private http: HttpClient) { }

  getEmployeeIntegrations(startDate: String, endDate: String, unit: String): Observable<Record<string, number>>{
    if (this.hardCodedActive) {
      return new Observable<Record<string, number>>(observer => {
        observer.next(this.getHardcodedData(unit));
        observer.complete();
      });
    }
    return this.http.get<Record<string, number>>(`${this.url}${this.employee}${this.report}${this.integrations}?from=${startDate}&to=${endDate}`);
  }

  getEmployeeDeleted(startDate: String, endDate: String, unit: String): Observable<Record<string, number>>{
    if (this.hardCodedActive) {
      return this.http.get<Record<string, number>>(`${this.url}${this.employee}${this.report}${this.hardCodedMapping}${this.integrations}?unit=${unit}`);
    }
    return this.http.get<Record<string, number>>(`${this.url}${this.employee}${this.report}${this.deleted}?from=${startDate}&to=${endDate}`);
  }

  getDepartmentIntegrations(startDate: String, endDate: String, unit: String): Observable<Record<string, number>>{
    if (this.hardCodedActive) {
      return this.http.get<Record<string, number>>(`${this.url}${this.employee}${this.report}${this.hardCodedMapping}${this.integrations}?unit=${unit}`);
    }
    return this.http.get<Record<string, number>>(`${this.url}${this.department}${this.report}${this.integrations}?from=${startDate}&to=${endDate}`);
  }

  getDepartmentDeleted(startDate: String, endDate: String, unit: String): Observable<Record<string, number>>{
    if (this.hardCodedActive) {
      return this.http.get<Record<string, number>>(`${this.url}${this.employee}${this.report}${this.hardCodedMapping}${this.integrations}?unit=${unit}`);
    }
    return this.http.get<Record<string, number>>(`${this.url}${this.department}${this.report}${this.deleted}?from=${startDate}&to=${endDate}`);
  }

  getWorkstationIntegrations(startDate: String, endDate: String, unit: String): Observable<Record<string, number>>{
    if (this.hardCodedActive) {
      return this.http.get<Record<string, number>>(`${this.url}${this.employee}${this.report}${this.hardCodedMapping}${this.integrations}?unit=${unit}`);
    }
    return this.http.get<Record<string, number>>(`${this.url}${this.workstations}${this.report}${this.integrations}?from=${startDate}&to=${endDate}`);
  }

  getWorkstationDeleted(startDate: String, endDate: String, unit: String): Observable<Record<string, number>>{
    if (this.hardCodedActive) {
      return this.http.get<Record<string, number>>(`${this.url}${this.employee}${this.report}${this.hardCodedMapping}${this.integrations}?unit=${unit}`);
    }
    return this.http.get<Record<string, number>>(`${this.url}${this.workstations}${this.report}${this.deleted}?from=${startDate}&to=${endDate}`);
  }

  public getHardcodedData(unit: String): Record<string, number> {
    const data: Record<string, number> = {};

    if (unit === "MONTH") {
        data["Enero"] = 10;
        data["Febrero"] = 20;
        data["Marzo"] = 32;
        data["Abril"] = 15;
        data["Mayo"] = 25;
        data["Junio"] = 30;
        data["Julio"] = 10;
        data["Agosto"] = 20;
        data["Septiembre"] = 32;
        data["Octubre"] = 15;
        data["Noviembre"] = 25;
        data["Diciembre"] = 30;
    } else if (unit === "DAY") {
        data["Lunes"] = 10;
        data["Martes"] = 20;
        data["Miércoles"] = 32;
        data["Jueves"] = 15;
        data["Viernes"] = 25;
        data["Sábado"] = 30;
        data["Domingo"] = 10;
    } else if (unit === "WEEK") {
        data["Semana 1"] = 10;
        data["Semana 2"] = 20;
        data["Semana 3"] = 32;
        data["Semana 4"] = 15;
        data["Semana 5"] = 25;
    } else {
        data["2012"] = 10;
        data["2013"] = 20;
        data["2014"] = 32;
        data["2015"] = 15;
        data["2016"] = 25;
        data["2017"] = 30;
        data["2018"] = 10;
        data["2019"] = 20;
        data["2020"] = 32;
        data["2021"] = 15;
        data["2022"] = 25;
        data["2023"] = 30;
        data["2024"] = 10;
    }

    return data;
}
}
