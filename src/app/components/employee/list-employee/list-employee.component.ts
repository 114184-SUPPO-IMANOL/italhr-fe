import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../services/employee/employee.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 


@Component({
  selector: 'app-list-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-employee.component.html',
  styleUrl: './list-employee.component.css'
})
export class ListEmployeeComponent {

  employees: any = [];
  employeesWithoutFilter: any = [];
  inputForFilter: string = '';
  flagActive: boolean = false;
  loading: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  pagination: any = [];

  constructor(private router: Router, private employeeService: EmployeeService) { }

  ngOnInit() {
    this.loading = true;
    this.getAllEmployees();
    this.employeesWithoutFilter = this.employees;
  }
  getAllEmployees() {
    this.employeeService.getEmployees().subscribe((data: any) => {
      data.forEach((x: any) => {
        let employee = {
          id: x.id,
          firstName: x.first_name,
          lastName: x.last_name,
          documentNumber: x.document_number,
          isActive: x.is_active,
          isReferent: x.is_referent
        }
        this.employees.push(employee);
      })
      this.pageChanged(1);
      this.loading = false;
    }, (error: any) => {
      console.log(error);
      Swal.fire({
        title: "Error!",
        text: "No se pudo cargar la lista de empleados.",
        icon: "error"
      });
      this.router.navigate(['home']);
      });
  }

  showConfirmationDelete(employee: any) {
    Swal.fire({
      title: "Estas seguro?",
      text: "Se dará de baja el empleado!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, dar de baja!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(employee.id).subscribe(
          (data: any) => {
          this.employees[this.employees.indexOf(employee)].isActive = false;
          Swal.fire({
            title: "Éxito!",
            text: "Se dió de baja el empleado.",
            icon: "success"
          });
        },
        (error: any) => {
          console.log(error);
          Swal.fire({
            title: "Error!",
            text: "No se pudo dar de baja el empleado.",
            icon: "error"
          });
        });
      }
    });
  }
  showConfirmationActive(employee: any) {
    Swal.fire({
      title: "Estas seguro?",
      text: "Se dará de alta el empleado!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, dar de alta!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.activateEmployee(employee.id).subscribe(
          (data: any) => {
          this.employees[this.employees.indexOf(employee)].isActive = true;
          Swal.fire({
            title: "Éxito!",
            text: "Se dió de alta el empleado.",
            icon: "success"
          });
        },
        (error: any) => {
          console.log(error);
          Swal.fire({
            title: "Error!",
            text: "No se pudo dar de alta el empleado.",
            icon: "error"
          });
        });
      }
    });
  }
  openUpdate(employee: any) {
    this.router.navigate(['employees',  employee.id]);
  }
  openInfo(employee: any) {
    throw new Error('Method not implemented.');
  }
  filter($event: Event) {
    throw new Error('Method not implemented.');
  }
  openCreateEmployee() {
    this.router.navigate(['employees','add']);
  }
  downloadList() {
    let data = this.employees;
    let headers = ["Legajo", "Nombre", "Apellido", "Documento", "Activo"];
    let dataForPdf = data.map((x: { id: any; firstName: any; lastName: any; documentNumber: any; isActive: any; }) => [x.id, x.firstName, x.lastName, x.documentNumber, x.isActive ? 'Si' : 'No']);
    this.generatePdf(dataForPdf, headers, 'Listado de empleados');
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Descargando listado...",
      showConfirmButton: false,
      timer: 1500
    });
  }

  generatePdf(data: any[], columns: any[], title: string): void {
    const pdf = new jsPDF() as any;

    pdf.text(title, 10, 10);

    pdf.autoTable({
      startY: 20,
      head: [columns],
      body: data,
      theme: 'grid',
      styles: { cellWidth: 'auto', overflow: 'linebreak', fontSize: 7, cellPadding: 1, minCellHeight: 10 },
      headStyles: { fontStyle: 'bold', fillColor: [22, 160, 133] }, // Personaliza según tus necesidades
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' } }, // Ajusta según tus necesidades
    });

    pdf.save('table.pdf');
  }

  callFilterActives(event: any) {
    this.employees = this.employeesWithoutFilter;
    if(this.inputForFilter != ''){
      this.onfilterInput(this.inputForFilter)
    }
    this.filterActives(event.target.checked);
    this.pageChanged(1);
  }

  callfilterInput(event: any) {
    this.employees = this.employeesWithoutFilter;
    this.onfilterInput(event.target.value);
    this.filterActives(this.flagActive);
    this.pageChanged(1);
  }

  filterActives(isActive: boolean) {
    if (isActive) {
      this.employees = this.employees.filter((x: { isActive: any; }) => x.isActive);
    }
  }

  onfilterInput(filter: string) {
    let filterFirstName: any[] = this.filterFirstName(filter);
    let filterLastName: any[] = this.filterLastName(filter);
    let filterDocument: any[] = this.filterDocument(filter);
    let filterId: any[] = this.filterId(filter);

    let filterList: any[] = filterFirstName
      .concat(filterLastName, filterDocument, filterId)
      .filter((item, index, array) => array.indexOf(item) === index);
    this.employees = filterList;
    
  }

  filterFirstName(input: string): any[] {
    return this.employees.filter((word: { firstName: string; }) => {
      const lowerCaseWord = word.firstName.toLowerCase();
      return lowerCaseWord.startsWith(input.toLowerCase());
    });
  }

  filterLastName(input: string): any[] {
    return this.employees.filter((word: { lastName: string; }) => {
      const lowerCaseWord = word.lastName.toLowerCase();
      return lowerCaseWord.startsWith(input.toLowerCase());
    });
  }

  filterDocument(input: string): any[] {
    return this.employees.filter((word: { documentNumber: string; }) => {
      const lowerCaseWord = word.documentNumber.toLowerCase();
      return lowerCaseWord.startsWith(input);
    });
  }

  filterId(input: string): any[] {
    return this.employees.filter((word: { id: number; }) => {
      const lowerCaseWord = word.id.toString();
      return lowerCaseWord.startsWith(input);
    });
  }

  get totalPages(): number {
    return Math.ceil(this.employees.length / this.itemsPerPage);
  }

  pageChanged(page: number) {

    if (page >= 1) {
      const startIndex = (page - 1) * this.itemsPerPage;
      this.currentPage = page;
      this.pagination = this.employees.slice(startIndex, startIndex + this.itemsPerPage);
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

}
