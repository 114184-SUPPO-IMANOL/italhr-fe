import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AddEmployeeComponent } from './components/employee/add-employee/add-employee.component';
import { AddDepartmentComponent } from './components/department/add-department/add-department.component';
import { HomeComponent } from './components/home/home/home.component';
import { AddWorkstationComponent } from './components/workstation/add-workstation/add-workstation.component';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, AddEmployeeComponent, AddDepartmentComponent, AddWorkstationComponent, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'italhr-fe';


  onDownloadTermsAndConditions() {
    const pdf = new jsPDF() as any;

    pdf.text('Términos y condiciones', 10, 10);
    
    pdf.save('terms-and-conditions.pdf');
  }

}
