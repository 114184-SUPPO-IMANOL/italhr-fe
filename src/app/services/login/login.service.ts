import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  url: string = "http://localhost:8080/login"

  constructor(private http: HttpClient) { }

  post(login: any): Observable<any> {
    return this.http.post(this.url, login);
  }
}
