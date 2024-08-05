import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../../services/department/department.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 

@Component({
  selector: 'app-list-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-department.component.html',
  styleUrl: './list-department.component.css'
})
export class ListDepartmentComponent {

  departments: any = [];
  departmentsWithoutFilter: any = [];

  inputForFilter: string = '';
  flagActive: boolean = false;
  loading: boolean = false;

  constructor(private router: Router, private departmentService: DepartmentService) { }

  ngOnInit() {
    this.loading = true;
    this.getAllDepartments();
    this.departmentsWithoutFilter = this.departments;
  }

  getAllDepartments() {
    this.departmentService.getAll().subscribe((data: any) => {
      console.log(data);
      data.forEach((x: any) => {
        let department = {
          id: x.id,
          name: x.name,
          capacity: x.capacity,
          isActive: x.is_active,
          vacancies: 0
        }
        this.departmentService.getVacancies(x.id).subscribe((vacancies: any) => {
          department.vacancies = vacancies;
        });
        this.departments.push(department);
      })
      this.loading = false;
    }, (error: any) => {
      console.log(error);
      Swal.fire({
        title: "Error!",
        text: "No se pudo cargar la lista de departamentos.",
        icon: "error"
      });
      this.router.navigate(['home']);
    })
  }

  showConfirmationDelete(department: any) {
    Swal.fire({
      title: "Estas seguro?",
      text: "Se dará de baja el departamento!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, dar de baja!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.departmentService.delete(department.id).subscribe(
          (data: any) => {
            this.departments[this.departments.indexOf(department)].isActive = false;
            Swal.fire({
              title: "Éxito!",
              text: "Se dió de baja el departamento.",
              icon: "success"
            });
          },
          (error: any) => {
            console.log(error);
            Swal.fire({
              title: "Error!",
              text: "No se pudo dar de baja el departamento.",
              icon: "error"
            });
          }
        );
      }
    });
  }
  showConfirmationActivate(department: any) {
    Swal.fire({
      title: "Estas seguro?",
      text: "Se dará de alta el departamento!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, dar de alta!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.departmentService.activate(department.id).subscribe(
          (data: any) => {
            this.departments[this.departments.indexOf(department)].isActive = true;
            Swal.fire({
              title: "Éxito!",
              text: "Se dió de alta el departamento.",
              icon: "success"
            });
          },
          (error: any) => {
            console.log(error);
            Swal.fire({
              title: "Error!",
              text: "No se pudo dar de alta el departamento.",
              icon: "error"
            });
          }
        );
      }
    });
  }
  openUpdate(department: any) {
    this.router.navigate(['departments',  department.id]);
  }
  openInfo(department: any) {
    throw new Error('Method not implemented.');
  }

  downloadList() {
    let data = this.departments;
    let headers = ["#", "Nombre", "Capacidad", "Vacantes", "Activo"];
    let dataForPdf = data.map((x: { id: any; name: any; capacity: any; vacancies: any; isActive: any; }) => [x.id, x.name, x.capacity, x.vacancies, x.isActive ? 'Si' : 'No']);
    this.generatePdf(dataForPdf, headers, 'Listado de departamentos');
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

  filter($event: Event) {
    throw new Error('Method not implemented.');
  }
  openCreateEmployee() {
    this.router.navigate(['departments','add']);
  }

  callFilterActives(event: any) {
    this.departments = this.departmentsWithoutFilter;
    if(this.inputForFilter != ''){
      this.onfilterInput(this.inputForFilter)
    }
    this.filterActives(event.target.checked);
  }

  callfilterInput(event: any) {
    this.departments = this.departmentsWithoutFilter;
    this.onfilterInput(event.target.value);
    this.filterActives(this.flagActive);
  }

  filterActives(isActive: boolean) {
    if (isActive) {
      this.departments = this.departments.filter((x: { isActive: any; }) => x.isActive);
    }
  }

  onfilterInput(filter: string) {
    let filterName: any[] = this.filterName(filter);
    let filterCapacity: any[] = this.filterCapicity(filter);

    let filterList: any[] = filterName
      .concat(filterCapacity)
      .filter((item, index, array) => array.indexOf(item) === index);
    this.departments = filterList;
    
  }

  filterName(input: string): any[] {
    return this.departments.filter((word: { name: string; }) => {
      const lowerCaseWord = word.name.toLowerCase();
      return lowerCaseWord.startsWith(input.toLowerCase());
    });
  }

  filterCapicity(input: string): any[] {
    return this.departments.filter((word: { capacity: number; }) => {
      const lowerCaseWord = word.capacity.toString();
      return lowerCaseWord.startsWith(input);
    });
  }

}
