import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  url: string = 'http://localhost:8080/';

  constructor(private http: HttpClient) { }

  getNationalities(): Observable<any> {
    return this.http.get(this.url + 'nationalities');
  }

  getDocumentTypes(): Observable<any> {
    return this.http.get(this.url + 'document-types');
  }
}
