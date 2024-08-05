import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkstationService {

  url: string = 'http://localhost:8080/workstations';

  constructor(private http: HttpClient) { }

  getDetailById(id: number): Observable<any> {
    return this.http.get(`${this.url}/details/${id}`);
  }

  getAll(): Observable<any> {
    return this.http.get(this.url);
  }
  
  getAllActive(): Observable<any> {
    return this.http.get(`${this.url}/actives`);
  }

  post(workstation: any): Observable<any> {
    return this.http.post(this.url, workstation);
  }

  put(workstation: any, id: number): Observable<any> {
    return this.http.put(`${this.url}/${id}`, workstation);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  activate(id: number): Observable<any> {
    return this.http.put(this.url + '/' + id + '/activate', null);
  }

  isExist(name: string): Observable<any> {
    return this.http.get(`${this.url}/exists?name=${name}`);
  }
}
