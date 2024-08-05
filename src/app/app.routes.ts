import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home/home.component';
import { AddEmployeeComponent } from './components/employee/add-employee/add-employee.component';
import { AddDepartmentComponent } from './components/department/add-department/add-department.component';
import { AddUserComponent } from './components/user/add-user/add-user.component';
import { AddWorkstationComponent } from './components/workstation/add-workstation/add-workstation.component';
import { ListEmployeeComponent } from './components/employee/list-employee/list-employee.component';
import { ListDepartmentComponent } from './components/department/list-department/list-department.component';
import { ListWorkstationComponent } from './components/workstation/list-workstation/list-workstation.component';
import { UpdateEmployeeComponent } from './components/employee/update-employee/update-employee.component';
import { UpdateDepartmentComponent } from './components/department/update-department/update-department.component';
import { UpdateWorkstationComponent } from './components/workstation/update-workstation/update-workstation.component';
import { LoginComponent } from './components/login/login/login.component';
import { ChangePasswordComponent } from './components/login/change-password/change-password.component';
import { EmployeeOnboardingComponent } from './components/reports/employee-onboarding/employee-onboarding.component';
import { TermsAndConditionsComponent } from './components/utils/terms-and-conditions/terms-and-conditions.component';
import { FrequentQuestionsComponent } from './components/utils/frequent-questions/frequent-questions.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'employees', children: [
        {path: '', component: ListEmployeeComponent},
        {path: 'add', component: AddEmployeeComponent},
        {path: ':id', component: UpdateEmployeeComponent}
    ]},
    {path: 'departments', children: [
        {path: '', component: ListDepartmentComponent},
        {path: 'add', component: AddDepartmentComponent},
        {path: ':id', component: UpdateDepartmentComponent}
    ]},
    {path: 'users', children: [
        {path: ':id', component: AddUserComponent}
    ]},
    {path: 'workstations', children: [
        {path: '', component: ListWorkstationComponent},
        {path: 'add', component: AddWorkstationComponent},
        {path: ':id', component: UpdateWorkstationComponent}
    ]},
    {path: 'login', component: LoginComponent},
    {path: 'forgot-password', component: ChangePasswordComponent},
    {path: 'reports', children: [
        {path: 'employees', component: EmployeeOnboardingComponent}
    ]},
    {path: 'terms-and-conditions', component: TermsAndConditionsComponent},
    {path: 'frequent-questions', component: FrequentQuestionsComponent},
    {path: '**', redirectTo: 'login'},
];
