import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DepartmentService } from '../../../services/department/department.service';
import { DepartmentResponseDTO } from '../../../models/department/department-response-dto';
import { EmployeeResponseDTO } from '../../../models/employee/response/employee-response';
import { EmployeeService } from '../../../services/employee/employee.service';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';

class RepeatDepartmentAsyncValidator {
  static createValidator(service: DepartmentService): AsyncValidatorFn {
    return (c: AbstractControl): Observable<ValidationErrors | null> => {
      return service.isExist(c.value).pipe(
        map((response) => {
          if(response){
            return { repeated : true};
          }
          return null;
        })
      );
    };
  }
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
  selector: 'app-add-department',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-department.component.html',
  styleUrl: './add-department.component.css'
})
export class AddDepartmentComponent {

  form: FormGroup = new FormGroup({});

  departments: DepartmentResponseDTO[] = [];
  referents: EmployeeResponseDTO[] = [];

  constructor(private fb: FormBuilder, private departmentService: DepartmentService, private   employeeService: EmployeeService, private router: Router) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required], [RepeatDepartmentAsyncValidator.createValidator(this.departmentService)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      chief: ['', [Validators.required]],
      upperDepartment: [''],
    });
    this.loadUpperDeparments();
    this.loadReferents();
  }

  loadUpperDeparments() {
    this.departmentService.getAllActives().subscribe(
      (response) => {
        console.log(response);
        response.forEach((x: any) => {
          let department: DepartmentResponseDTO = {
            id: x.id,
            name: x.name,
            parentDepartmentId: x.parent_department_id,
            chiefId: x.chief_id,
            capacity: x.capacity,
            createdAt: x.created_at,
            updatedAt: x.updated_at,
            isActive: x.is_active
          };
          this.departments.push(department);
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loadReferents() {
    this.employeeService.getAllReferents().subscribe(
      (response) => {
        console.log(response);
        response.forEach((x: any) => {
          let employee: EmployeeResponseDTO = {
            id: x.id,
            firstName: x.first_name,
            lastName: x.last_name,
            documentNumber: x.document_number,
            workstationId: x.workstation_id,
            startDate: x.start_date,
            reasonForIncorporation: x.reason_for_incorporation,
            workload: x.workload,
            workdayType: x.workday_type,
            contractType: x.contract_type,
            contractFrom: x.contract_from,
            contractTo: x.contract_to,
            chiefRemarksId: x.chief_remarks_id,
            remunerationId: x.remuneration_id,
            otherRemarksId: x.other_remarks_id,
            authorizationId: x.authorization_id,
            referentId: x.referent_id,
            isReferent: x.is_referent,
            isActive: x.is_active
          };
          this.referents.push(employee);
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ngSubmit() {
    if (this.form.valid) {
      let newDepartment = {
        name: this.form.value.name,
        capacity: this.form.value.capacity,
        chief_id: this.form.value.chief,
        upper_department_id: this.form.value.upperDepartment == "" ? null : this.form.value.upperDepartment,
      };

      Swal.fire({
        title: "Estás seguro?",
        text: "Se agregará el departamento!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, agregar!"
      }).then((result) => {
        if (result.isConfirmed) {
            this.createDepartment(newDepartment);
        }
      });
    } else {
      markFormGroupTouched(this.form);
    }
  }

  createDepartment(newDepartment: any) {
    this.departmentService.post(newDepartment).subscribe(
      (response) => {
      console.log(response);
      Swal.fire({
        title: "Agregado!",
        text: "Se agregó el departamento!.",
        icon: "success"
      });
      this.form.reset()
      this.router.navigate(['departments']);
    },
    (error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se pudo guardar el departamento!",
      });
      console.log(error);
    });
  }

  cancel() {
    Swal.fire({
      title: "Estas seguro?",
      text: "Se perderán los cambios!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, cancelar!",
      cancelButtonText: "No, seguir aquí!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Cancelado!",
          text: "Se canceló la solicitud para agregar un departamento.",
          icon: "success"
        });
        this.form.reset()
        this.router.navigate(['departments']);
      }
    });
  }

}
