import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { create } from 'domain';
import { Observable, map, repeat } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


class RepeatEmailAsyncValidator {
  static createValidator(service: UserService): AsyncValidatorFn {
    return (c: AbstractControl): Observable<ValidationErrors | null> => {
      return service.getUserByEmail(c.value).pipe(
        map((response) => {
          if(response != null){
            return { repeated : true};
          }
          return null;
        })
      );
    };
  }
}

function passwordMatchValidator(
  c: AbstractControl
): { [key: string]: boolean } | null {
  const password = c.get('password');
  const repeatPassword = c.get('repeatPassword');
  if (password!.value !== repeatPassword!.value) {
    return { 'match-password': true };
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
  selector: 'app-add-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {

  form: FormGroup = new FormGroup({});

  idEmployee: number = 0;

  get passwordGroup(): FormGroup {
    return this.form.get('passwordGroup') as FormGroup;
  }

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private userService: UserService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(p => {
      this.idEmployee = +p.get('id')!;
      console.log(this.idEmployee);
    });
    this.form = this.createForm();
  }

  createForm() {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email], RepeatEmailAsyncValidator.createValidator(this.userService)],
      passwordGroup: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_@#$%^&+=])[A-Za-z\d-_@#$%^&+=]+$/)]],
        repeatPassword: ['', [Validators.required]]
      }, 
      { validator: passwordMatchValidator }),
      role: ['', [Validators.required]],
    });
  }

  ngSubmit() {
    markFormGroupTouched(this.form);
    markFormGroupTouched(this.passwordGroup)
    if (!this.form.invalid) {
      let newUser = {
        email: this.form.value.email,
        password: this.form.value.passwordGroup.password,
        repeatPassword: this.form.value.passwordGroup.repeatPassword,
        role: this.form.value.role,
        employee_id: this.idEmployee
      }
      Swal.fire({
        title: "Estas seguro?",
        text: "Se agregará el usuario!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, agregar!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.userService.post(newUser).subscribe(
            (response) => {
              Swal.fire({
                title: "Agregado!",
                text: "Se agregó el usuario! su username es: " + response.username,
                icon: "success"
              });
              this.router.navigate(['home']);
            },
            (error) => {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Algo salio mal!",
              });
              console.log(error);
            }
          );
        }
      });
      
    }
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
          text: "Se canceló la solicitud para agregar un usuario.",
          icon: "success"
        });
        this.form.reset();
        this.router.navigate(['home']);
      }
    });
  }
}
