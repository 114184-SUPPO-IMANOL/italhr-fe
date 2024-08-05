import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url: string = "http://localhost:8080/users"

  constructor(private http: HttpClient) { }

  post(user: any): Observable<any> {
    return this.http.post(this.url, user);
  }

  getUserByEmail(email: string): Observable<any> {
    return this.http.get(`${this.url}?email=${email}`);
  }

  generateTokenByEmail(email: String): Observable<any> {
    return this.http.post(`${this.url}/generate-token`, email);
  }

  validateToken(id: number, token: string): Observable<any> {
    return this.http.post(`${this.url}/access-token/${id}`, token);
  }

  changePassword(id: number, password: string): Observable<any> {
    return this.http.put(`${this.url}/change-password/${id}`, password);
  }
}
