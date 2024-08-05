import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  url: string = 'http://localhost:8080/departments';

  constructor(private http: HttpClient) { }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}`);
  }

  getAll(): Observable<any> {
    return this.http.get(this.url);
  }

  getAllActives(): Observable<any> {
    return this.http.get(`${this.url}/actives`);
  }

  getVacancies(id: number): Observable<any> {
    return this.http.get(`${this.url}/${id}/vacancies`);
  }

  isExist(name: string): Observable<any> {
    return this.http.get(`${this.url}/exists?name=${name}`);
  }

  post(department: any): Observable<any> {
    return this.http.post(this.url, department);
  }

  put(department: any, id: number): Observable<any> {
    return this.http.put(this.url + '/' + id, department)
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  activate(id: number): Observable<any> {
    return this.http.put(this.url + '/' + id + '/activate', null);
  }

}
