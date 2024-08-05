import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';

function markFormGroupTouched(formGroup: FormGroup) {
  Object.values(formGroup.controls).forEach((control: AbstractControl) => {
    control.markAsTouched();

    if (control instanceof FormGroup) {
      markFormGroupTouched(control);
    }
  });
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
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {

  loading: boolean = false;
  pageValidateEmail: boolean = true;
  pageAccessToken: boolean = false;
  pageChangePassword: boolean = false;
  formChangePassword: FormGroup = new FormGroup({});
  formValidateToken: FormGroup = new FormGroup({});
  formValidateEmail: FormGroup = new FormGroup({});
  id: number = 0;
  email: string = '';
  tokenExpiredDate: Date = new Date();
  counter: String = '05:00';
  timeLimit = 5 * 60;

  constructor(private userService: UserService, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formValidateEmail = this.createFormValidateEmail();
    this.formValidateToken = this.createFormValidateToken();
    this.formChangePassword = this.createFormChangePassword();
  }


  createFormValidateEmail() {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  createFormValidateToken() {
    return this.fb.group({
      token1: ['', [Validators.required]],
      token2: ['', [Validators.required]],
      token3: ['', [Validators.required]],
      token4: ['', [Validators.required]],
      token5: ['', [Validators.required]],
      token6: ['', [Validators.required]],
    })
  }

  createFormChangePassword() {
    return this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[-_@#$%^&+=])[A-Za-z\d-_@#$%^&+=]+$/)]],
      repeatPassword: ['', [Validators.required]]
    }, 
    { validator: passwordMatchValidator });
  }

  onSubmitValidateEmail() {
    markFormGroupTouched(this.formValidateEmail);
    if(this.formValidateEmail.valid){
      this.email = this.formValidateEmail.get('email')?.value;
      this.loading = true;
      this.userService.generateTokenByEmail(this.email).subscribe(
        (response: any) => {
          this.loading = false;
          Swal.fire({
            title: '¡Éxito!',
            text: 'Se envió el token al correo electrónico',
            icon: 'success',
          })
          setTimeout(() => {
            this.pageValidateEmail = false;
            this.pageAccessToken = true;
            this.id = response.user_id;
            this.tokenExpiredDate = new Date(response.expiration_date);
            this.timeLimit = this.getRemainingMinutes(this.tokenExpiredDate, new Date()) * 60;
            this.initCounter();
          }, 1000); 
        },
        (error: any) => {
          this.loading = false;
          if(error.status === 404){
            Swal.fire({
              title: '¡Error!',
              text: 'No se pudo validar correctamente su email.',
              icon: 'error',
            });
          }else {
            Swal.fire({
              title: '¡Error!',
              text: 'Error al enviar el correo electrónico.',
              icon: 'error',
            });
          }
        }
      );
    }
  }

  onSubmitValidateToken() {
    markFormGroupTouched(this.formValidateToken);
    if (this.formValidateToken.valid) {
      let token = `${this.formValidateToken.get('token1')?.value}${this.formValidateToken.get('token2')?.value}`
        + `${this.formValidateToken.get('token3')?.value}${this.formValidateToken.get('token4')?.value}`
        + `${this.formValidateToken.get('token5')?.value}${this.formValidateToken.get('token6')?.value}`;
      this.userService.validateToken(this.id, token).subscribe(
        (response: any) => {
          if(response) {
            Swal.fire({
              title: '¡Éxito!',
              text: 'Token validado correctamente',
              icon: 'success',
            });
            setTimeout(() => {
              this.pageAccessToken = false;
              this.pageChangePassword = true;
            }, 1000);
          }
          else {
            Swal.fire({
              title: '¡Error!',
              text: 'Token incorrecto',
              icon: 'error',
            });
          }
        },
        (error: any) => {
          console.log(error);
          if (error.status === 404) {
            Swal.fire({
              title: '¡Error!',
              text: 'Token incorrecto',
              icon: 'error',
            });
          } else {
            Swal.fire({
              title: '¡Error!',
              text: 'Error al validar el token',
              icon: 'error',
            });
          }
        }
      );
    }
    else {
      Swal.fire({
        title: '¡Error!',
        text: 'Token incorrecto',
        icon: 'error',
      });
    }
  }

  onSumbitChangePassword() {
    markFormGroupTouched(this.formChangePassword);
    if (this.formChangePassword.valid) {
      let id = this.id;
      let password = this.formChangePassword.get('password')?.value;
      Swal.fire({
        title: "Estas seguro?",
        text: "Se cambiará la contraseña!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, cambiar!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.userService.changePassword(id, password).subscribe(
            (response) => {
              Swal.fire({
                title: "Éxito!",
                text: "Se cambió la contraseña del usuario " + response.username,
                icon: "success"
              });
              this.router.navigate(['/login']);
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

  onCancelar(){
    Swal.fire({
      title: `¿Estás seguro que desea volver al login?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "¡Sí, volver!",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['login'])
      }
    });
  }

  initCounter() {
    const interval = setInterval(() => {
      const minutos = Math.floor(this.timeLimit / 60);
      let segundos = this.timeLimit % 60;

      const timeFormated = `${minutos < 10 ? '0' : ''}${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
      
      this.counter = timeFormated;

      this.timeLimit--;

      if (this.timeLimit < 0) {
        clearInterval(interval);
        this.counter = "00:00";
      }
    }, 1000);
  }

  resetToken() {
    Swal.fire({
      title: `¿Estás seguro que desea volver a enviar el token?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "¡Sí, volver!",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.pageAccessToken = false;
        this.userService.generateTokenByEmail(this.email).subscribe(
          (response: any) => {
            this.loading = false;
            this.pageAccessToken = true;
            Swal.fire({
              title: '¡Éxito!',
              text: 'Se envió el token al correo electrónico',
              icon: 'success',
            });
            this.id = response.user_id;
            this.tokenExpiredDate = new Date(response.expiration_date);
            this.timeLimit = this.getRemainingMinutes(this.tokenExpiredDate, new Date()) * 60;
            this.formValidateToken.reset();
          },
          (error: any) => {
            if (error.status === 404) {
              Swal.fire({
                title: '¡Error!',
                text: 'No se pudo validar correctamente su email.',
                icon: 'error',
              });
            } else {
              Swal.fire({
                title: '¡Error!',
                text: 'Error al enviar el correo electrónico.',
                icon: 'error',
              });
            }
          }
        );
      }
    });
  }

  getRemainingMinutes(date: Date, now: Date) {
    const diff = date.getTime() - now.getTime();
    return Math.floor(diff / 60000) + 1;
  }

  changeInput(input: string) {
    const element = document.getElementById(input);
    element?.focus();
  }

}
