import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router: Router) {
  }

  open(component: string) {
    this.router.navigate([component]);
  }

  async openReports() {
    const { value: chartType } = await Swal.fire({
      title: 'Seleccione el modulo',
      input: 'select',
      inputOptions: {
        employees: 'Empleados',
        departments: 'Departamentos',
      },
      inputPlaceholder: 'Seleccione un modulo',
      showCancelButton: true,
      confirmButtonColor: "#007bff",
      cancelButtonColor: "#6c757d",
      confirmButtonText: 'Generar',
      cancelButtonText: 'Cancelar',
    });

    if (!chartType) {
      return;
    }

    this.router.navigate(['/reports/' + chartType]);
  }
}
