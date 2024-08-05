import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModelMapperPipe } from '../../../pipes/model-mapper.pipe';
import { EmployeeService } from '../../../services/employee/employee.service';
import { Observable, map } from 'rxjs';
import { PersonService } from '../../../services/employee/person.service';
import Swal from 'sweetalert2'
import { FileUploadModule } from 'primeng/fileupload';
import { ImageService } from '../../../services/employee/image.service';
import { UtilService } from '../../../services/util/util.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentResponseDTO } from '../../../models/department/department-response-dto';
import { EmployeeResponseDTO } from '../../../models/employee/response/employee-response';
import { DepartmentService } from '../../../services/department/department.service';
import { WorkstationService } from '../../../services/workstation/workstation.service';

class RepeatPersonAsyncValidator {
  static createValidator(service: PersonService, currentDocumentNumber: string): AsyncValidatorFn {
    return (c: AbstractControl): Observable<ValidationErrors | null> => {
      if (c.value != currentDocumentNumber) {
        return service.getPersonByDocumentNumber(c.value).pipe(
          map((response) => {
            if (response) {
              return { repeated: true };
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

function dateRangeValidator(c: AbstractControl): { [key: string]: boolean } | null {
  const contractFromTemporary = new Date(c.get('contractFromTemporary')?.value);
  const contractToTemporary = new Date(c.get('contractToTemporary')?.value);
  if (contractFromTemporary && contractToTemporary && contractFromTemporary > contractToTemporary) {
    return { 'invalid-date-range': true };
  }
  return null;
}

@Component({
  selector: 'app-update-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FileUploadModule],
  providers: [ModelMapperPipe],
  templateUrl: './update-employee.component.html',
  styleUrl: './update-employee.component.css'
})
export class UpdateEmployeeComponent {

  formPage1: FormGroup = new FormGroup({});
  formPage2: FormGroup = new FormGroup({});
  formPage3: FormGroup = new FormGroup({});
  formPage4: FormGroup = new FormGroup({});
  formPage5: FormGroup = new FormGroup({});
  formPage6: FormGroup = new FormGroup({});

  page: number = 1;

  employeeForm: any = {
    id: 0,
    person: {
      firstName: '',
      lastName: '',
      documentType: '',
      documentNumber: '',
      gender: '',
      maritalStatus: '',
      birthDate: '',
      nationality: ''
    },
    workstationId: 0,
    departmentId: 0,
    startDate: '',
    reasonForIncorporation: '',
    workload: 0,
    workdayType: '',
    contractType: '',
    contractFrom: '',
    contractTo: '',
    chiefRemarks: {
      id: 0,
      membersTeamQuantity: 0,
      estimatedEffect: ''
    },
    remuneration: {
      id: 0,
      monthlySalary: 0,
      annualSalary: 0,
      comments: ''
    },
    otherRemarks: {
      id: 0,
      manager: '',
      requestReceived: '',
      comments: ''
    },
    authorization: {
      id: 0,
      requestReceived: '',
      comments: '',
      isAuthorized: false
    },
    referentId: 0,
    isReferent: false,
    isActive: false
  };

  selectedFile: File | undefined;
  formData: FormData = new FormData();

  loading: boolean = false;

  initialContractType = "";

  get temporaryGroup(): FormGroup {
    return this.formPage3.get('temporaryGroup') as FormGroup;
  }

  departments: DepartmentResponseDTO[] = [];
  workstations: any[] = [];
  referents: EmployeeResponseDTO[] = [];
  nationalities: string[] = []

  constructor(private mapper: ModelMapperPipe, private fb: FormBuilder, private employeeService: EmployeeService, private personService: PersonService, private imageService: ImageService, private utilService: UtilService, private router: Router, private departmentService: DepartmentService, private workstationService: WorkstationService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.loading = true;
    this.formPage1 = this.createFormPage1();
    this.formPage2 = this.createFormPage2();
    this.formPage3 = this.createFormPage3();
    this.formPage4 = this.createFormPage4();
    this.formPage5 = this.createFormPage5();
    this.formPage6 = this.createFormPage6();
    this.activatedRoute.paramMap.subscribe(p => {
      this.employeeForm.id = +p.get('id')!;
      this.loadEmployee(this.employeeForm.id);
    });
    setTimeout(() => {
      this.updateFormPage1();
      this.updateFormPage2();
      this.updateFormPage3();
      this.updateFormPage4();
      this.updateFormPage5();
      this.updateFormPage6();
      this.getNationalities();
      this.getDepartments();
      this.getWorkstations();
      this.getReferents();
      this.setContractType(this.employeeForm.contractType);
      this.loading = false;
    }, 1000);
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
          if (x.id != this.employeeForm.id) {
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

          }

        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loadEmployee(id: number) {
    this.employeeService.getEmployeeDetail(id).subscribe(
      (response) => {
        console.log(response);
        this.employeeForm.person = {
          firstName: response.person.first_name,
          lastName: response.person.last_name,
          documentType: response.person.document_type,
          documentNumber: response.person.document_number,
          gender: response.person.gender,
          maritalStatus: response.person.marital_status,
          birthDate: response.person.birth_date,
          nationality: response.person.nationality
        },
        this.employeeForm.workstationId = response.workstation_id;
        this.employeeForm.departmentId = response.department_id;
        this.employeeForm.startDate = response.start_date;
        this.employeeForm.reasonForIncorporation = response.reason_for_incorporation;
        this.employeeForm.workload = response.workload;
        this.employeeForm.workdayType = response.workday_type;
        this.employeeForm.contractType = response.contract_type;
        this.employeeForm.contractFrom = response.contract_from;
        this.employeeForm.contractTo = response.contract_to;
        this.employeeForm.chiefRemarks = {
          id: response.chief_remarks_id,
          membersTeamQuantity: response.chief_remarks.members_team_quantity,
          estimatedEffect: response.chief_remarks.estimated_effect,
        },
          this.employeeForm.remuneration = {
            id: response.remuneration_id,
            monthlySalary: response.remuneration.monthly_salary,
            annualSalary: response.remuneration.annual_salary,
            comments: response.remuneration.comments,
          },
          this.employeeForm.otherRemarks = {
            id: response.other_remarks_id,
            manager: response.other_remarks.manager,
            requestReceived: response.other_remarks.request_received,
            comments: response.other_remarks.comments,
          },
          this.employeeForm.authorization = {
            id: response.authorization_id,
            requestReceived: response.authorization.request_received,
            comments: response.authorization.comments,
            isAuthorized: response.authorization.is_authorized,
          },
          this.employeeForm.referentId = response.referent_id;
        this.employeeForm.isReferent = response.is_referent;
        this.employeeForm.isActive = response.is_active;
        this.initialContractType = response.contract_type;
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
      documentNumber: ['', [Validators.required], RepeatPersonAsyncValidator.createValidator(this.personService, this.employeeForm.person.documentNumber)],
      gender: [''],
      maritalStatus: [''],
      birthDate: ['', [Validators.required, this.ageValidator]],
      nationality: ['', [Validators.required]],
    });
  }

  createFormPage2() {
    return this.fb.group({
      workstation: ['', [Validators.required]],
      department: ['', [Validators.required]],
      reasonForIncorporation: ['', [Validators.required, Validators.maxLength(255)]]
    });
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
      manager: ['', [Validators.required, Validators.maxLength(255)]],
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


  updateFormPage1() {
    this.formPage1 = this.fb.group({
      firstName: [ this.employeeForm.person.firstName, [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')]],
      lastName: [this.employeeForm.person.lastName, [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')]],
      documentType: [this.employeeForm.person.documentType, [Validators.required]],
      documentNumber: [this.employeeForm.person.documentNumber, [Validators.required], RepeatPersonAsyncValidator.createValidator(this.personService, this.employeeForm.person.documentNumber)],
      gender: [this.employeeForm.person.gender],
      maritalStatus: [this.employeeForm.person.maritalStatus],
      birthDate: [this.employeeForm.person.birthDate, [Validators.required, this.ageValidator]],
      nationality: [this.employeeForm.person.nationality, [Validators.required]],
    });
  }

  updateFormPage2() {
    this.formPage2.patchValue({
      workstation: this.employeeForm.workstationId,
      department: this.employeeForm.departmentId,
      reasonForIncorporation: this.employeeForm.reasonForIncorporation,
    });
  }

  updateFormPage3() {
    this.formPage3.patchValue({
      workload: this.employeeForm.workload,
      contractFromIndefinite: this.employeeForm.contractType == 'INDEFINITE' ? this.employeeForm.contractFrom : '',
      temporaryGroup: {
        contractFromTemporary: this.employeeForm.contractType == 'TEMPORARY' ? this.employeeForm.contractFrom : '',
        contractToTemporary: this.employeeForm.contractType == 'TEMPORARY' ? this.employeeForm.contractTo : '',
      },
      membersTeamQuantity: this.employeeForm.chiefRemarks.membersTeamQuantity,
      effectEstimated: this.employeeForm.chiefRemarks.estimatedEffect,
    });
  }

  updateFormPage4() {
    this.formPage4.patchValue({
      monthlySalary: this.employeeForm.remuneration.monthlySalary,
      annualSalary: this.employeeForm.remuneration.annualSalary,
      commentsSalary: this.employeeForm.remuneration.comments,
      manager: this.employeeForm.otherRemarks.manager,
      requestReceived: this.employeeForm.otherRemarks.requestReceived,
      commentsOther: this.employeeForm.otherRemarks.comments,
    });
  }

  updateFormPage5() {
    this.formPage5.patchValue({
      referent: this.employeeForm.referentId,
      isReferent: this.employeeForm.isReferent,
    });
  }

  updateFormPage6() {
    this.formPage6.patchValue({
      comments: this.employeeForm.authorization.comments,
      isAuthorized: true,
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

  changesDateTemporaryValidates(value: boolean) {
    if (value) {
      this.temporaryGroup.get('contractFromTemporary')?.addValidators([Validators.required, this.dateAfterBirthValidator.bind(this)]);
      this.temporaryGroup.get('contractToTemporary')?.addValidators([Validators.required]);
      this.temporaryGroup.addValidators([dateRangeValidator]);

      this.temporaryGroup.get('contractFromTemporary')?.setValue(this.initialContractType == 'TEMPORARY' ? this.employeeForm.contractFrom : '');
      this.temporaryGroup.get('contractToTemporary')?.setValue(this.initialContractType == 'TEMPORARY' ? this.employeeForm.contractTo : '');
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
      this.formPage3.get('contractFromIndefinite')?.setValue(this.initialContractType == 'INDEFINITE' ? this.employeeForm.contractFrom : '');
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
    return !this.formPage1.invalid && !this.formPage2.invalid && !this.formPage3.invalid && !this.formPage4.invalid && !this.formPage5.invalid && !this.formPage6.invalid;
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
      referentId: this.employeeForm.referentId,
      isReferent: this.formPage5.get('isReferent')!.value,
    }
  }


  onSubmit() {
    console.log(this.formPage1)
    console.log(this.formPage2)
    console.log(this.formPage3)
    console.log(this.formPage4)
    console.log(this.formPage5)
    console.log(this.formPage6)
    if (this.formsValid()) {
      var newEmployee = this.mapper.toSnakeCase(this.mapEmployee());
      Swal.fire({
        title: "Estás seguro?",
        text: "Se actualizará el empleado!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, actualizar!"
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.saveDateImage()) {
            this.saveImage(newEmployee);
          } else {
            this.updateEmployee(newEmployee);
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
        this.updateEmployee(newEmployee);
      },
      (error) => {
        alert("Error al subir la imagen");
        console.log(error);
      });
  }

  updateEmployee(newEmployee: any) {
    debugger
    this.employeeService.putEmployee(newEmployee, this.employeeForm.id).subscribe(
      (response) => {
        Swal.fire({
          title: "Actualizado!",
          text: "Se actualizó el empleado con legajo: " + response.id,
          icon: "success"
        });
        this.clearForms();
        this.page = 1;
        this.router.navigate(['employees']);
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No se pudo actualizar el empleado!",
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
          text: "Se canceló la solicitud para actualizar un empleado.",
          icon: "success"
        });
        this.clearForms();
        this.page = 1;
        this.router.navigate(['employees']);
      }
    });
  }

}
