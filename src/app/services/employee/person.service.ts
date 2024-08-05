import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class PersonService {

  constructor(private http: HttpClient) { }

  url: string = 'http://localhost:8080/persons';

  getPersonByDocumentNumber(documentNumber: string) {
    return this.http.get(this.url + "?documentNumber=" + documentNumber);
  }
}
