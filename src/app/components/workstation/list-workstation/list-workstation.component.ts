import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WorkstationService } from '../../../services/workstation/workstation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 

@Component({
  selector: 'app-list-workstation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-workstation.component.html',
  styleUrl: './list-workstation.component.css'
})
export class ListWorkstationComponent {

  workstations: any = [];
  workstationsWithoutFilter: any = [];
  inputForFilter: string = '';
  flagActive: boolean = false;
  loading: boolean = false;

  constructor(private router: Router, private workstationService: WorkstationService) { }

  ngOnInit() {
    this.loading = true;
    this.getAllworkstations();
    this.workstationsWithoutFilter = this.workstations;
  }
  getAllworkstations() {
    this.workstationService.getAll().subscribe((data: any) => {
      data.forEach((x: any) => {
        let workstation = {
          id: x.id,
          name: x.name,
          dependents: x.dependents,
          isActive: x.is_active
        }
        this.workstations.push(workstation);
      })
    }, (error: any) => {
      console.log(error);
      Swal.fire({
        title: "Error!",
        text: "No se pudo cargar la lista de puestos.",
        icon: "error"
      });
      this.router.navigate(['home']);
    });
    this.loading = false;
  }

  showConfirmationDelete(workstation: any) {
    Swal.fire({
      title: "Estas seguro?",
      text: "Se dará de baja el puesto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, dar de baja!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.workstationService.delete(workstation.id).subscribe(
          (data: any) => {
            this.workstations[this.workstations.indexOf(workstation)].isActive = false;
            Swal.fire({
              title: "Éxito!",
              text: "Se dió de baja el puesto.",
              icon: "success"
            });
          },
          (error: any) => {
            console.log(error);
            Swal.fire({
              title: "Error!",
              text: "No se pudo dar de baja el puesto.",
              icon: "error"
            });
          });
      }
    });
  }
  showConfirmationActivate(workstation: any) {
    Swal.fire({
      title: "Estas seguro?",
      text: "Se dará de alta el puesto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, dar de alta!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.workstationService.activate(workstation.id).subscribe(
          (data: any) => {
            this.workstations[this.workstations.indexOf(workstation)].isActive = true;
            Swal.fire({
              title: "Éxito!",
              text: "Se dió de alta el puesto.",
              icon: "success"
            });
          },
          (error: any) => {
            console.log(error);
            Swal.fire({
              title: "Error!",
              text: "No se pudo dar de alta el puesto.",
              icon: "error"
            });
          });
      }
    });
  }
  openUpdate(workstation: any) {
    this.router.navigate(['workstations', workstation.id]);
  }
  openInfo(workstation: any) {
    throw new Error('Method not implemented.');
  }
  downloadList() {
    let data = this.workstations;
    let headers = ["#", "Nombre", "Dependientes", "Activo"];
    let dataForPdf = data.map((x: { id: any; name: any; dependents: any; isActive: any; }) => [x.id, x.name, x.dependents, x.isActive ? 'Si' : 'No']);
    this.generatePdf(dataForPdf, headers, 'Listado de puestos');
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
    this.router.navigate(['workstations', 'add']);
  }

  callFilterActives(event: any) {
    this.workstations = this.workstationsWithoutFilter;
    if (this.inputForFilter != '') {
      this.onfilterInput(this.inputForFilter)
    }
    this.filterActives(event.target.checked);
  }

  callfilterInput(event: any) {
    this.workstations = this.workstationsWithoutFilter;
    this.onfilterInput(event.target.value);
    this.filterActives(this.flagActive);
  }

  filterActives(isActive: boolean) {
    if (isActive) {
      this.workstations = this.workstations.filter((x: { isActive: any; }) => x.isActive);
    }
  }

  onfilterInput(filter: string) {
    let filterFirstName: any[] = this.filterName(filter);
    let filterDependents: any[] = this.filterDependents(filter);

    let filterList: any[] = filterFirstName
      .concat(filterDependents)
      .filter((item, index, array) => array.indexOf(item) === index);
    this.workstations = filterList;

  }

  filterName(input: string): any[] {
    return this.workstations.filter((word: { name: string; }) => {
      const lowerCaseWord = word.name.toLowerCase();
      return lowerCaseWord.startsWith(input.toLowerCase());
    });
  }

  filterDependents(input: string): any[] {
    return this.workstations.filter((word: { dependents: number; }) => {
      const lowerCaseWord = word.dependents.toString();
      return lowerCaseWord.startsWith(input);
    });
  }

}
