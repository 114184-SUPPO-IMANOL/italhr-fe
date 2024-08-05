import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkstationService } from '../../../services/workstation/workstation.service';
import Swal from 'sweetalert2';
import { Observable, map } from 'rxjs';

class RepeatWorkstationAsyncValidator {
  static createValidator(service: WorkstationService): AsyncValidatorFn {
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

function markFormArrayTouched(formArray: FormArray) {
  formArray.controls.forEach((control: AbstractControl) => {
    control.markAsTouched();

    if (control instanceof FormGroup) {
      markFormGroupTouched(control as FormGroup);
    } else if (control instanceof FormArray) {
      markFormArrayTouched(control as FormArray);
    }
  });
}

@Component({
  selector: 'app-add-workstation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-workstation.component.html',
  styleUrl: './add-workstation.component.css'
})
export class AddWorkstationComponent {

  formPage1: FormGroup = new FormGroup({});
  formPage2: FormGroup = new FormGroup({});
  formPage3: FormGroup = new FormGroup({});
  formPage4: FormGroup = new FormGroup({});
  formPage5: FormGroup = new FormGroup({});

  page: number = 1;
  gender: string = 'OTHER';
  minimalEducation: string = 'UNIVERSITY';

  get responsibilities(): FormArray {
    return this.formPage2.get('responsibilities') as FormArray;
  }

  get functions(): FormArray {
    return this.formPage3.get('functions') as FormArray;
  }

  constructor(private router: Router, private fb: FormBuilder, private workstationService: WorkstationService) { }

  ngOnInit() {
    this.formPage1 = this.createFromPage1();
    this.formPage2 = this.createFromPage2();
    this.formPage3 = this.createFromPage3();
    this.formPage4 = this.createFormPage4();
    this.formPage5 = this.createFormPage5();
  }

  createFromPage1() {
    return this.fb.group({
      name: ['', [Validators.required], RepeatWorkstationAsyncValidator.createValidator(this.workstationService)],
      dependents: ['', [Validators.required, Validators.min(1)]],
      objectives: ['', [Validators.required]],
    });
  }

  createFromPage2() {
    return this.fb.group({
      responsibilities: this.fb.array([this.buildArrayControlls()]),
    });
  }

  createFromPage3() {
    return this.fb.group({
      functions: this.fb.array([this.buildArrayControlls()]),
    });
  }

  createFormPage4() {
    return this.fb.group({
      ageCategory: ['', [Validators.min(1)]],
      gender: [''],
      placeResidency: [''],
      timeAvailability: [''],
      contractType: [''],
      minimalEducation: [''],
      title: [''],
      experience: [''],
    });
  }

  createFormPage5() {
    return this.fb.group({
      socialSkills: [''],
      manualSkills: [''],
      mentalSkills: [''],
      changeFlexibilities: [''],
      serviceVocation: [''],
      analyticalSkills: [''],
    });
  }

  buildArrayControlls() {
    return this.fb.group({
      name: ['', [Validators.required]],
    });
  }

  deleteArray(array: FormArray) {
    array.removeAt(array.length - 1)
  }
  addArray(array: FormArray) {
    array.push(this.buildArrayControlls());
  }

  setMinimalEducation(x: string) {
    this.minimalEducation = x;
  }
  setGender(x: string) {
    this.gender = x;
  }

  previousPage() {
    this.page--;
  }

  nextPage() {
    this.page++;
  }

  formsValid() {
    return this.formPage1.valid && this.formPage2.valid && this.formPage3.valid && this.formPage4.valid && this.formPage5.valid;
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
          text: "Se canceló la solicitud para agregar un puesto",
          icon: "success"
        });
        this.clearForms();
        this.page = 1;
        this.router.navigate(['workstations']);
      }
    });
  }

  onSubmit() {
    if (this.formsValid()) {
      let newWorkstation = this.createNewWorkstation();
      Swal.fire({
        title: "Estas seguro?",
        text: "Se agregará el puesto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, agregar!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.workstationService.post(newWorkstation).subscribe(
            (response) => {
              Swal.fire({
                title: "Agregado!",
                text: "Se agregó el puesto!",
                icon: "success"
              });
              this.clearForms();
              this.page = 1;
              this.router.navigate(['workstations']);
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
    } else {
      this.marksAllAsTouched();
    }
  }

  marksAllAsTouched() {
    markFormGroupTouched(this.formPage1);
    markFormGroupTouched(this.formPage2);
    markFormGroupTouched(this.formPage3);
    markFormGroupTouched(this.formPage4);
    markFormGroupTouched(this.formPage5);
    markFormArrayTouched(this.responsibilities);
    markFormArrayTouched(this.functions);
  }

  clearForms() {
    this.formPage1.reset();
    this.formPage2.reset();
    this.formPage3.reset();
    this.formPage4.reset();
    this.formPage5.reset();
  }

  createNewWorkstation() {
    return {
      name: this.formPage1.get('name')?.value,
      handbook: {
        objectives: this.formPage1.get('objectives')?.value,
        responsibilities: this.responsibilities.value.map((x: any) => x.name),
        functions: this.functions.value.map((x: any) => x.name),
        required_profile: {
          age_category: this.formPage4.get('ageCategory')?.value,
          place_residency: this.formPage4.get('placeResidency')?.value,
          time_availability: this.formPage4.get('timeAvailability')?.value,
          contract_type: this.formPage4.get('contractType')?.value,
          gender: this.gender,
          minimal_education: this.minimalEducation,
          title: this.formPage4.get('title')?.value,
          experience: this.formPage4.get('experience')?.value,
        },
        skills: {
          social_skills: this.formPage5.get('socialSkills')?.value,
          manual_skills: this.formPage5.get('manualSkills')?.value,
          mental_skills: this.formPage5.get('mentalSkills')?.value,
          change_flexibilities: this.formPage5.get('changeFlexibilities')?.value,
          service_vocation: this.formPage5.get('serviceVocation')?.value,
          analytical_skills: this.formPage5.get('analyticalSkills')?.value,
        }
      },
      dependents: this.formPage1.get('dependents')?.value,
    }
  }

}