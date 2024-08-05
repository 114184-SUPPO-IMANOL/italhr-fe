import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DepartmentService } from '../../../services/department/department.service';
import { DepartmentResponseDTO } from '../../../models/department/department-response-dto';
import { EmployeeResponseDTO } from '../../../models/employee/response/employee-response';
import { EmployeeService } from '../../../services/employee/employee.service';
import Swal from 'sweetalert2'
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 


class RepeatDepartmentAsyncValidator {
  static createValidator(service: DepartmentService, name: string): AsyncValidatorFn {
    return (c: AbstractControl): Observable<ValidationErrors | null> => {
      if (c.value != name) {
        return service.isExist(c.value).pipe(
          map((response) => {
            if(response){
              return { repeated : true};
            }
            return null;
          })
        );
      }
      return new Observable<null>();
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
  selector: 'app-update-department',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-department.component.html',
  styleUrl: './update-department.component.css'
})
export class UpdateDepartmentComponent {

  form: FormGroup = new FormGroup({});

  departments: DepartmentResponseDTO[] = [];
  referents: EmployeeResponseDTO[] = [];

  loading: boolean = false;

  departmentForm: DepartmentResponseDTO = {
    id: 0,
    name: '',
    parentDepartmentId: 0,
    chiefId: 0,
    capacity: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: false
  }

  constructor(private fb: FormBuilder, private departmentService: DepartmentService, private   employeeService: EmployeeService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.loading = true;
    this.activatedRoute.params.subscribe((params) => {
      this.createMyForm();
      this.departmentForm.id = params['id'];
      this.loadDepartment(this.departmentForm.id);
    });
    setTimeout(() => {
      this.updateMyForm();
      this.loadUpperDeparments();
      this.loadReferents();
      this.loading = false;
    }, 1000);
  }

  loadDepartment(id: number) {
    this.departmentService.getById(id).subscribe(
      (response) => {
        console.log(response);
        this.departmentForm = {
          id: response.id,
          name: response.name,
          parentDepartmentId: response.parent_department_id,
          chiefId: response.chief_id,
          capacity: response.capacity,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
          isActive: response.is_active
        };
      },
      (error) => {
        console.log(error);
    });
  }

  loadUpperDeparments() {
    this.departmentService.getAllActives().subscribe(
      (response) => {
        console.log(response);
        response.forEach((x: any) => {
          if (x.id != this.departmentForm.id) {
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
          }
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
          let employee: any = {
            id: x.id,
            firstName: x.first_name,
            lastName: x.last_name
          };
          this.referents.push(employee);
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  createMyForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required], [RepeatDepartmentAsyncValidator.createValidator(this.departmentService, this.departmentForm.name)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      chief: ['', [Validators.required]],
      upperDepartment: ['']
    });
  }
  updateMyForm() {
    this.form = this.fb.group({
      name: [this.departmentForm.name, [Validators.required], [RepeatDepartmentAsyncValidator.createValidator(this.departmentService, this.departmentForm.name)]],
      capacity: [this.departmentForm.capacity, [Validators.required, Validators.min(1)]],
      chief: [this.departmentForm.chiefId, [Validators.required]],
      upperDepartment: [this.departmentForm.parentDepartmentId]
    });
  }

  ngSubmit() {
    if (!this.form.invalid) {
      let newDepartment = {
        name: this.form.value.name,
        capacity: this.form.value.capacity,
        chief_id: this.form.value.chief,
        upper_department_id: this.form.value.upperDepartment == "" ? null : this.form.value.upperDepartment,
      };

      Swal.fire({
        title: "Estás seguro?",
        text: "Se actualizará el departamento!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, actualizar!"
      }).then((result) => {
        if (result.isConfirmed) {
            this.updateDepartment(newDepartment);
        }
      });
    } else {
      markFormGroupTouched(this.form);
    }
  }

  updateDepartment(newDepartment: any) {
    this.departmentService.put(newDepartment, this.departmentForm.id).subscribe(
      (response) => {
      console.log(response);
      Swal.fire({
        title: "Actualizado!",
        text: "Se actualizó el departamento!.",
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
          text: "Se canceló la solicitud para actualizar un departamento.",
          icon: "success"
        });
        this.form.reset()
        this.router.navigate(['departments']);
      }
    });
  }


}
