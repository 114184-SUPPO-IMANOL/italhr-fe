import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import Swal from 'sweetalert2'
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { WorkstationService } from '../../../services/workstation/workstation.service';


class RepeatWorkstationAsyncValidator {
  static createValidator(service: WorkstationService, name: string): AsyncValidatorFn {
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
  selector: 'app-update-workstation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-workstation.component.html',
  styleUrl: './update-workstation.component.css'
})
export class UpdateWorkstationComponent {


  formPage1: FormGroup = new FormGroup({});
  formPage2: FormGroup = new FormGroup({});
  formPage3: FormGroup = new FormGroup({});
  formPage4: FormGroup = new FormGroup({});
  formPage5: FormGroup = new FormGroup({});

  page: number = 1;
  gender: string = 'OTHER';
  minimalEducation: string = 'UNIVERSITY';

  loading: boolean = false;

  workstation: any = {
    id: 0,
    name: '',
    handbook: {
      objectives: '',
      responsabilities: [],
      functions: [],
      requiredProfile: {
        ageCategory: 0,
        gender: '',
        placeResidency: '',
        timeAvailability: '',
        contractType: '',
        minimalEducation: '',
        title: '',
        experience: '',
      },
      skills: {
        socialSkills: '',
        manualSkills: '',
        mentalSkills: '',
        changeFlexibility: '',
        serviceVocation: '',
        analyticalSkills: '',
    }
  },
  dependents: 0,
  isActive: true,
  };

  get responsibilities(): FormArray {
    return this.formPage2.get('responsibilities') as FormArray;
  }

  get functions(): FormArray {
    return this.formPage3.get('functions') as FormArray;
  }

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private fb: FormBuilder, private workstationService: WorkstationService) { }

  ngOnInit() {
    this.loading = true;
    this.activatedRoute.params.subscribe((params) => {
      this.formPage1 = this.createFromPage1();
      this.formPage2 = this.createFromPage2();
      this.formPage3 = this.createFromPage3();
      this.formPage4 = this.createFormPage4();
      this.formPage5 = this.createFormPage5();
      this.workstation.id = params['id'];
      this.uploadWorkstation(params['id']);

      setTimeout(() => {
        this.formPage1 = this.updateFromPage1();
        this.formPage4 = this.updateFormPage4();
        this.formPage5 = this.updateFormPage5();
        this.uploadArrayControlls();
        this.loading = false;
      }, 1000);
    });
  }

  uploadWorkstation(id: number) {
    this.workstationService.getDetailById(id).subscribe(
      (response) => {
        this.workstation.name = response.name;
        this.workstation.handbook.objectives = response.handbook.objectives;
        this.workstation.handbook.responsabilities = response.handbook.responsibilities;
        this.workstation.handbook.functions = response.handbook.functions;
        this.workstation.handbook.requiredProfile.ageCategory = response.handbook.required_profile.age_category;
        this.workstation.handbook.requiredProfile.gender = response.handbook.required_profile.gender;
        this.workstation.handbook.requiredProfile.placeResidency = response.handbook.required_profile.place_residency;
        this.workstation.handbook.requiredProfile.timeAvailability = response.handbook.required_profile.time_availability;
        this.workstation.handbook.requiredProfile.contractType = response.handbook.required_profile.contract_type;
        this.workstation.handbook.requiredProfile.minimalEducation = response.handbook.required_profile.minimal_education;
        this.workstation.handbook.requiredProfile.title = response.handbook.required_profile.title;
        this.workstation.handbook.requiredProfile.experience = response.handbook.required_profile.experience;
        this.workstation.handbook.skills.socialSkills = response.handbook.skills.social_skills;
        this.workstation.handbook.skills.manualSkills = response.handbook.skills.manual_skills;
        this.workstation.handbook.skills.mentalSkills = response.handbook.skills.mental_skills;
        this.workstation.handbook.skills.changeFlexibility = response.handbook.skills.change_flexibility;
        this.workstation.handbook.skills.serviceVocation = response.handbook.skills.service_vocation;
        this.workstation.handbook.skills.analyticalSkills = response.handbook.skills.analytical_skills;
        this.workstation.dependents = response.dependents;
        this.workstation.isActive = response.is_active;
      },
      (error) => {
        console.log(error);
      });
  }

  createFromPage1() {
    return this.fb.group({
      name: [ this.workstation.name, [Validators.required], RepeatWorkstationAsyncValidator.createValidator(this.workstationService, this.workstation.name)],
      dependents: [this.workstation.dependents, [Validators.required, Validators.min(1)]],
      objectives: [this.workstation.handbook.objectives, [Validators.required]],
    });
  }

  createFromPage2() {
    return this.fb.group({
      responsibilities: this.fb.array([]),
    });
  }

  createFromPage3() {
    return this.fb.group({
      functions: this.fb.array([]),
    });
  }

  createFormPage4() {
    return this.fb.group({
      ageCategory: [this.workstation.handbook.requiredProfile.ageCategory, [Validators.min(1)]],
      gender: [this.workstation.handbook.requiredProfile.gender],
      placeResidency: [this.workstation.handbook.requiredProfile.placeResidency],
      timeAvailability: [this.workstation.handbook.requiredProfile.timeAvailability],
      contractType: [this.workstation.handbook.requiredProfile.contractType],
      minimalEducation: [this.workstation.handbook.requiredProfile.minimalEducation],
      title: [this.workstation.handbook.requiredProfile.title],
      experience: [this.workstation.handbook.requiredProfile.experience],
    });
  }

  createFormPage5() {
    return this.fb.group({
      socialSkills: [this.workstation.handbook.skills.socialSkills],
      manualSkills: [this.workstation.handbook.skills.manualSkills],
      mentalSkills: [this.workstation.handbook.skills.mentalSkills],
      changeFlexibilities: [this.workstation.handbook.skills.changeFlexibility],
      serviceVocation: [this.workstation.handbook.skills.serviceVocation],
      analyticalSkills: [this.workstation.handbook.skills.analyticalSkills],
    });
  }

  updateFromPage1() {
    return this.fb.group({
      name: [ this.workstation.name, [Validators.required], RepeatWorkstationAsyncValidator.createValidator(this.workstationService, this.workstation.name)],
      dependents: [this.workstation.dependents, [Validators.required, Validators.min(1)]],
      objectives: [this.workstation.handbook.objectives, [Validators.required]],
    });
  }

  updateFormPage4() {
    return this.fb.group({
      ageCategory: [this.workstation.handbook.requiredProfile.ageCategory, [Validators.min(1)]],
      gender: [this.workstation.handbook.requiredProfile.gender],
      placeResidency: [this.workstation.handbook.requiredProfile.placeResidency],
      timeAvailability: [this.workstation.handbook.requiredProfile.timeAvailability],
      contractType: [this.workstation.handbook.requiredProfile.contractType],
      minimalEducation: [this.workstation.handbook.requiredProfile.minimalEducation],
      title: [this.workstation.handbook.requiredProfile.title],
      experience: [this.workstation.handbook.requiredProfile.experience],
    });
  }

  updateFormPage5() {
    return this.fb.group({
      socialSkills: [this.workstation.handbook.skills.socialSkills],
      manualSkills: [this.workstation.handbook.skills.manualSkills],
      mentalSkills: [this.workstation.handbook.skills.mentalSkills],
      changeFlexibilities: [this.workstation.handbook.skills.changeFlexibility],
      serviceVocation: [this.workstation.handbook.skills.serviceVocation],
      analyticalSkills: [this.workstation.handbook.skills.analyticalSkills],
    });
  }

  uploadArrayControlls() {
    if (this.workstation.handbook.responsabilities) {
      this.workstation.handbook.responsabilities.forEach((x: string) => {
        this.responsibilities.push(this.fb.group({ name: [x, [Validators.required]] }));
      });
    }
    if (this.workstation.handbook.functions) {
      this.workstation.handbook.functions.forEach((x: string) => {
        this.functions.push(this.fb.group({ name: [x, [Validators.required]] }));
      });
    }
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
    return !this.formPage1.invalid && this.formPage2.valid && this.formPage3.valid && this.formPage4.valid && this.formPage5.valid;
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
          text: "Se canceló la solicitud para actualizar un puesto",
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
        text: "Se actualizará el puesto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, actualizar!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.workstationService.put(newWorkstation, this.workstation.id).subscribe(
            (response) => {
              Swal.fire({
                title: "Actualizado!",
                text: "Se actualizó el puesto!",
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
