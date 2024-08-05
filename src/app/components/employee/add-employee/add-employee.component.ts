import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModelMapperPipe } from '../../../pipes/model-mapper.pipe';
import { EmployeeRequest } from '../../../models/employee/request/employee-request';
import { EmployeeService } from '../../../services/employee/employee.service';
import { Observable, map, retry } from 'rxjs';
import { PersonService } from '../../../services/employee/person.service';
import Swal from 'sweetalert2'
import { FileUploadModule } from 'primeng/fileupload';
import { ImageService } from '../../../services/employee/image.service';
import { UtilService } from '../../../services/util/util.service';
import { Router } from '@angular/router';
import { DepartmentResponseDTO } from '../../../models/department/department-response-dto';
import { EmployeeResponseDTO } from '../../../models/employee/response/employee-response';
import { DepartmentService } from '../../../services/department/department.service';
import { WorkstationService } from '../../../services/workstation/workstation.service';


class RepeatPersonAsyncValidator {
  static createValidator(service: PersonService): AsyncValidatorFn {
    return (c: AbstractControl): Observable<ValidationErrors | null> => {
      return service.getPersonByDocumentNumber(c.value).pipe(
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

function dateRangeValidator(c: AbstractControl): { [key: string]: boolean } | null {
  const contractFromTemporary = new Date(c.get('contractFromTemporary')?.value);
  const contractToTemporary = new Date(c.get('contractToTemporary')?.value);
  if (contractFromTemporary && contractToTemporary && contractFromTemporary > contractToTemporary) {
    return { 'invalid-date-range': true };
  }
  return null;
}

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FileUploadModule],
  providers: [ModelMapperPipe],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.css'
})
export class AddEmployeeComponent {

  formPage1: FormGroup = new FormGroup({});
  formPage2: FormGroup = new FormGroup({});
  formPage3: FormGroup = new FormGroup({});
  formPage4: FormGroup = new FormGroup({});
  formPage5: FormGroup = new FormGroup({});
  formPage6: FormGroup = new FormGroup({});

  page: number = 1;

  employeeForm: EmployeeRequest = new EmployeeRequest();

  selectedFile: File | undefined;
  formData: FormData = new FormData();

  get temporaryGroup(): FormGroup {
    return this.formPage3.get('temporaryGroup') as FormGroup;
  }

  departments: DepartmentResponseDTO[] = [];
  workstations: any[] = [];
  referents: EmployeeResponseDTO[] = [];
  nationalities: string[] = []

  constructor(private mapper: ModelMapperPipe, private fb: FormBuilder, private employeeService: EmployeeService, private personService: PersonService, private imageService: ImageService, private utilService: UtilService, private router: Router, private departmentService: DepartmentService, private workstationService: WorkstationService) { }

  ngOnInit(): void {
    this.formPage1 = this.createFormPage1();
    this.formPage2 = this.createFormPage2();
    this.formPage3 = this.createFormPage3();
    this.formPage4 = this.createFormPage4();
    this.formPage5 = this.createFormPage5();
    this.formPage6 = this.createFormPage6();
    this.employeeForm.person.gender = 'OTHER';
    this.employeeForm.person.maritalStatus = 'WIDOWED';
    this.employeeForm.contractType = 'INDEFINITE';
    this.employeeForm.workdayType = 'FULL_TIME';
    this.getNationalities();
    this.getDepartments();
    this.getWorkstations();
    this.getReferents();
  }

  getDepartments() {
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

  getWorkstations() {
    this.workstationService.getAllActive().subscribe(
      (response) => {
        console.log(response);
        response.forEach((x: any) => {
          let workstation: any = {
            id: x.id,
            name: x.name,
            isActive: x.is_active
          };
          this.workstations.push(workstation);
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }
  

  getNationalities() {
    this.utilService.getNationalities().subscribe(
      (response) => {
        this.nationalities = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getReferents() {
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

  createFormPage1() {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')]],
      documentType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required], RepeatPersonAsyncValidator.createValidator(this.personService)],
      gender: [''],
      maritalStatus: [''],
      birthDate: ['', [Validators.required, this.ageValidator]],
      nationality: ['', [Validators.required]],
    });
  }

  ageValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value) {
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        return { 'invalidAge': true };
      }
    }
    return null;
  }

  createFormPage2() {
    return this.fb.group({
      workstation: ['', [Validators.required]],
      department: ['', [Validators.required]],
      reasonForIncorporation: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  dateAfterBirthValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const birthDateControl = this.formPage1.get('birthDate');
    if (control.value && birthDateControl?.value) {
      const startDate = new Date(control.value);
      const birthDate = new Date(birthDateControl.value);
      birthDate.setFullYear(birthDate.getFullYear() + 18);
      if (startDate < birthDate) {
        return { 'younger': true };
      }
    }
    return null;
  }

  createFormPage3() {
    this.formPage3 = this.fb.group({
      workload: ['', [Validators.required, Validators.min(1), Validators.max(48)]],
      contractFromIndefinite: ['', [Validators.required, this.dateAfterBirthValidator.bind(this)]],
      temporaryGroup: this.fb.group(
        {
        contractFromTemporary: ['', [this.dateAfterBirthValidator.bind(this)]],
        contractToTemporary: [''],
        },
        { validators: [dateRangeValidator] }
      ),
      membersTeamQuantity: ['', [Validators.required, Validators.min(1)]],
      effectEstimated: ['', [Validators.maxLength(255)]]
    });
  
    return this.formPage3;
  }

  createFormPage4() {
    return this.fb.group({
      monthlySalary: ['', [Validators.required, Validators.min(1)]],
      //TODO: Validar que el annualSalary sea mayor que el monthlySalary
      annualSalary: ['', [Validators.required, Validators.min(1)]],
      commentsSalary: ['', [Validators.maxLength(255)]],
      manager: ['', [Validators.required, Validators.maxLength(255), Validators.pattern('^[a-zA-Z ]*$')]],
      requestReceived: ['', [Validators.required]],
      commentsOther: ['', [Validators.maxLength(255)]],
    });
  }

  createFormPage5() {
    return this.fb.group({
      referent: [''],
      isReferent: [false],
    });
  }

  createFormPage6() {
    return this.fb.group({
      comments: ['', [Validators.maxLength(255)]],
      isAuthorized: [true],
    });
  }

  changesDateTemporaryValidates(value: boolean) {
    if (value) {
      this.temporaryGroup.get('contractFromTemporary')?.addValidators([Validators.required, this.dateAfterBirthValidator.bind(this)]);
      this.temporaryGroup.get('contractToTemporary')?.addValidators([Validators.required]);
      this.temporaryGroup.addValidators([dateRangeValidator]);
    } else {
      this.temporaryGroup.get('contractFromTemporary')?.clearValidators();
      this.temporaryGroup.get('contractToTemporary')?.clearValidators();
      this.temporaryGroup.clearValidators();

      this.temporaryGroup.get('contractFromTemporary')?.setValue('');
      this.temporaryGroup.get('contractToTemporary')?.setValue('');
    }
    this.temporaryGroup.get('contractFromTemporary')?.updateValueAndValidity();
    this.temporaryGroup.get('contractToTemporary')?.updateValueAndValidity();
    this.temporaryGroup.updateValueAndValidity();
    this.temporaryGroup.markAsUntouched();
  }

  changeDateIndefiniteValidates(value: boolean) {
    if (value) {
      this.formPage3.get('contractFromIndefinite')?.addValidators([Validators.required, this.dateAfterBirthValidator.bind(this)]);
    } else {
      this.formPage3.get('contractFromIndefinite')?.clearValidators();
      this.formPage3.get('contractFromIndefinite')?.setValue('');
    }
    this.formPage3.get('contractFromIndefinite')?.updateValueAndValidity();
    this.formPage3.get('contractFromIndefinite')?.markAsUntouched();
  }

  nextPage() {
    this.page++;
  }
  previousPage() {
    this.page--;
  }
  
  changePage(page: number) {
    this.page = page;
  }
  

  setReferent(id: number) {
    this.employeeForm.referentId = id;
  }

  setGender(gender: string) {
    this.employeeForm.person.gender = gender;
  }

  setMaritalStatus(maritalStatus: string) {
    this.employeeForm.person.maritalStatus = maritalStatus;
  }

  setContractType(contractType: string) {
    this.employeeForm.contractType = contractType;
    if (contractType == 'TEMPORARY') {
      this.changesDateTemporaryValidates(true);
      this.changeDateIndefiniteValidates(false);
    }
    else {
      this.changeDateIndefiniteValidates(true);
      this.changesDateTemporaryValidates(false);
    }
    
  }

  setWorkdayType(workdayType: string) {
    this.employeeForm.workdayType = workdayType;
  }

  formsValid() {
    return !this.formPage1.valid && this.formPage2.valid && this.formPage3.valid && this.formPage4.valid && this.formPage5.valid && this.formPage6.valid;
  }

  onFileSelect(event: any) {
    this.selectedFile = event.files[0];
    console.log("Archivo seleccionado: ", this.selectedFile);
  }

  saveDateImage() {
    let filledIn = false;
    if (this.selectedFile) {
      filledIn = true;
      this.formData.delete("name");
      this.formData.delete("file");
      this.formData.append("name", this.getFileNameWithoutExtension(this.selectedFile.name));
      this.formData.append("file", this.selectedFile);
    }
    return filledIn;
  }

  getFileNameWithoutExtension(fileName: string) {
    return fileName.split('.')[0];
  }

  mapPerson() {
    return {
      firstName: this.formPage1.get('firstName')!.value,
      lastName: this.formPage1.get('lastName')!.value,
      documentType: this.formPage1.get('documentType')!.value,
      documentNumber: this.formPage1.get('documentNumber')!.value,
      gender: this.employeeForm.person.gender,
      maritalStatus: this.employeeForm.person.maritalStatus,
      nationality: this.formPage1.get('nationality')!.value,
      birthDate: this.formPage1.get('birthDate')!.value,
    }

  }

  mapChiefRemarks() {
    return {
      membersTeamQuantity: this.formPage3.get('membersTeamQuantity')!.value,
      estimatedEffect: this.formPage3.get('effectEstimated')!.value
    }
  }

  mapRemuneration() {
    return {
      monthlySalary: this.formPage4.get('monthlySalary')!.value,
      annualSalary: this.formPage4.get('annualSalary')!.value,
      comments: this.formPage4.get('commentsSalary')!.value
    }
  }

  mapOtherRemarks() {
    return {
      manager: this.formPage4.get('manager')!.value,
      requestReceived: this.formPage4.get('requestReceived')!.value,
      comments: this.formPage4.get('commentsOther')!.value
    }
  }

  mapAuthorization() {
    return {
      requestReceived: this.formPage4.get('requestReceived')!.value,
      comments: this.formPage6.get('comments')!.value,
      isAuthorized: this.formPage6.get('isAuthorized')!.value
    }
  }


  mapEmployee() {
    return {
      person: this.mapper.toSnakeCase(this.mapPerson()),
      workstationId: this.formPage2.get('workstation')!.value,
      departmentId: this.formPage2.get('department')!.value,
      startDate: this.employeeForm.contractType == 'INDEFINITE' ? this.formPage3.get('contractFromIndefinite')!.value : this.temporaryGroup.get('contractFromTemporary')!.value,
      reasonForIncorporation: this.formPage2.get('reasonForIncorporation')!.value,
      workload: this.formPage3.get('workload')!.value,
      workdayType: this.employeeForm.workdayType,
      contractType: this.employeeForm.contractType,
      contractFrom: this.employeeForm.contractType == 'INDEFINITE' ? this.formPage3.get('contractFromIndefinite')!.value : this.temporaryGroup.get('contractFromTemporary')!.value,
      contractTo: this.employeeForm.contractType == 'INDEFINITE' ? null : this.temporaryGroup.get('contractToTemporary')!.value,
      chiefRemarks: this.mapper.toSnakeCase(this.mapChiefRemarks()),
      remuneration: this.mapper.toSnakeCase(this.mapRemuneration()),
      otherRemarks: this.mapper.toSnakeCase(this.mapOtherRemarks()),
      authorization: this.mapper.toSnakeCase(this.mapAuthorization()),
      referentId: this.employeeForm.referentId == 0 ? null : this.employeeForm.referentId,
      isReferent: this.formPage5.get('isReferent')!.value,
      }
  }


  onSubmit() {
    console.log(this.formPage5)
    if (this.formsValid()) {
      var newEmployee = this.mapper.toSnakeCase(this.mapEmployee());
      Swal.fire({
        title: "Estás seguro?",
        text: "Se agregará el empleado!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, agregar!"
      }).then((result) => {
        if (result.isConfirmed) {
          if(this.saveDateImage()){
            this.saveImage(newEmployee);
          } else {
            this.saveEmployee(newEmployee);
          }
        }
      });
    } else {
      this.marksAllAsTouched();
    }
  } 

  saveImage(newEmployee: any) {
    this.imageService.post(this.formData).subscribe(
      (response) => {
        newEmployee.person.profile_picture = response;
        this.saveEmployee(newEmployee);
      },
      (error) => {
        alert("Error al subir la imagen");
        console.log(error);
      });
    }

  saveEmployee(newEmployee: any) {
    this.employeeService.postEmployee(newEmployee).subscribe(
      (response) => {
        Swal.fire({
          title: "Desea agregar un usuario?",
          text: "El empleado que agregó tiene permisos para ser un usuario!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, agregar un usuario!"
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Redirigiendo!",
              text: "Se redirigirá al formulario para agregar el usuario.",
              icon: "success"
            });
            this.clearForms();
            this.page = 1;
            this.router.navigate(['users', response.id]);
          }
          else {
            Swal.fire({
              title: "Agregado!",
              text: "Se agregó el empleado! su legajo es: " + response.id,
              icon: "success"
            });
            this.clearForms();
            this.page = 1;
            this.router.navigate(['employees']);
          }
        });
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No se pudo guardar el empleado!",
        });
        console.log(error);
      }
    );
  }

  marksAllAsTouched() {
    markFormGroupTouched(this.formPage1);
    markFormGroupTouched(this.formPage2);
    markFormGroupTouched(this.formPage3);
    markFormGroupTouched(this.formPage4);
    markFormGroupTouched(this.formPage5);
    markFormGroupTouched(this.formPage6);
  }

  clearForms() {
    this.formPage1.reset();
    this.formPage2.reset();
    this.formPage3.reset();
    this.formPage4.reset();
    this.formPage5.reset();
    this.formPage6.reset();
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
          text: "Se canceló la solicitud para agregar un empleado.",
          icon: "success"
        });
        this.clearForms();
        this.page = 1;
        this.router.navigate(['employees']);
      }
    });
  }
}
