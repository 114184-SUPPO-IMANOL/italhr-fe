import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  url: string = 'http://localhost:8080/stored-documents';

  constructor(private http: HttpClient) { }


  post(form: FormData): Observable<any> {
    return this.http.post(this.url, form);
  }
}
