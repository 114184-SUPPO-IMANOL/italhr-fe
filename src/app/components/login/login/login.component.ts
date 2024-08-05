import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../../services/login/login.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  showPassword: boolean = false;
  passwordFieldType: string = 'password';

  form: FormGroup = new FormGroup({});

  constructor(private router: Router, private fb: FormBuilder, private loginService: LoginService) { }

  ngOnInit(): void { 
    this.form = this.createMyForm();
  }

  createMyForm() {
    return this.fb.group({
      identity: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onLogin() {
    if (this.form.valid) {
      this.loginService.post(this.form.value).subscribe(
        (response) => {
          if (response != null) {
            Swal.fire({
              title: "Bienvenido!",
              text: "Inició sesión con el usuario: " + response.username,
              icon: "success"
            });
            this.router.navigate(['home']);
          }
        },
        (error) => {
          console.log(error);
          Swal.fire({
            title: "Error!",
            text: "Usuario o contraseña incorrectos",
            icon: "error"
          });
        }
      );
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.passwordFieldType = this.showPassword ? 'text' : 'password';
  }

  goToForgotPassword() {
    this.router.navigate(['forgot-password/']);
  }

}
