import { Component, input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../services/employee/employee.service';
import Swal from 'sweetalert2';
import { Chart, registerables } from 'chart.js';
import { ChartOptions } from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../services/report/report.service';


function dateRangeValidator(c: AbstractControl): { [key: string]: boolean } | null {
  const from = new Date(c.get('startDate')?.value);
  const to = new Date(c.get('endDate')?.value);
  if (from && to && from > to) {
    return { 'invalid-date-range': true };
  }
  return null;
}

function markFormGroupTouched(formGroup: FormGroup) {
  Object.values(formGroup.controls).forEach((control: AbstractControl) => {
    control.markAsTouched();

    if (control instanceof FormGroup) {
      markFormGroupTouched(control);
    }
  });
}

@Component({
  selector: 'app-employee-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee-onboarding.component.html',
  styleUrl: './employee-onboarding.component.css'
})
export class EmployeeOnboardingComponent {

  report: Record<string, number> = {};
  filterForm: FormGroup = new FormGroup({});
  myChart?: Chart;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private reportService: ReportService) { }

  ngOnInit(): void {
    this.filterForm = this.createFilterForm();
    Chart.register(...registerables);
  }

  createFilterForm() {
    return this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      type: ['integrations', [Validators.required]],
      graphic: ['bar', [Validators.required]],
      module: ['employee', [Validators.required]]
    }, { validators: dateRangeValidator })
  }

  async showGraphs() {
    markFormGroupTouched(this.filterForm);
    if (this.filterForm.valid) {
      let moduleType = this.filterForm.get('module')?.value;
      let type = this.filterForm.get('type')?.value;
      let graphic = this.filterForm.get('graphic')?.value;
      let startDate = this.filterForm.get('startDate')?.value;
      let endDate = this.filterForm.get('endDate')?.value;
      let unit = this.getUnitMeasurement(startDate, endDate);
      
      await this.reportService.getReport(startDate, endDate, unit, moduleType, type).toPromise().then(
        (response: Record<string, number> | undefined) => {
          if (response) {
            this.report = response;
          }
        }
      );

      const chartType = graphic;


      if (!chartType) {
        return;
      }

      this.loading = true;

      const labels = Object.keys(this.report);
      const data = Object.values(this.report);
      const dataSetLabel = "Alta de empleados";

      setTimeout(async () => {

        const ctx = document.getElementById('myChart') as HTMLCanvasElement;
        if (!ctx) {
          return;
        }

        if (this.myChart) {
          this.myChart.destroy();
        }
        this.myChart = new Chart(ctx, {
          type: chartType,
          data: {
            labels: labels,
            datasets: [{
              label: dataSetLabel,
              data: data,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            title: {
              display: true,
              text: 'Reporte de alta de empleados'
            },
            scales: {
              y: {
                beginAtZero: true
              }
            },
            responsive: true
          } as ChartOptions
        });

        this.loading = false;
      }, 1500);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Los campos son requeridos',
      });
    }
  }

  getUnitMeasurement(from: string, to: string): string {
    const fromDate = new Date(from);
    const toDate = new Date(to);
  
    const dayDifference = (toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24);
    if (dayDifference <= 7) {
      return "DAY";
    } else if (dayDifference <= 30) {
      return "WEEK";
    } else if (dayDifference <= 365) {
      return "MONTH";
    } else {
      return "YEAR";
    }
  }

  downloadChartAsPDF() {
    if (this.myChart) {
      const chartContainer = document.getElementById('chart');
      if (chartContainer) {
        html2canvas(chartContainer).then(canvas => {
          const imgData = canvas.toDataURL('image/png');

          // Calcula la proporción de la imagen para mantenerla dentro de los límites de la página PDF
          const imgWidth = 190; // Aproximadamente el ancho de una página A4
          const imgHeight = canvas.height * imgWidth / canvas.width;

          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
          pdf.save('reporte.pdf');
        });
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Descargando reporte...",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Primero genere un reporte',
      });
    }
  }

  clean() {
    this.filterForm.patchValue({
      startDate: '',
      endDate: '',
      type: '',
      graphic: '',
      module: ''
    });
    if (this.myChart) {
      this.myChart.destroy();
    }
  }

}
