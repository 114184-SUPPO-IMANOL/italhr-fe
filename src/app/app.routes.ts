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
import { NotFoundComponent } from './components/utils/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {path: 'home', component: HomeComponent, canActivate: [authGuard]},
    {path: 'employees', children: [
        {path: '', component: ListEmployeeComponent, canActivate: [authGuard]},
        {path: 'add', component: AddEmployeeComponent, canActivate: [authGuard]},
        {path: ':id', component: UpdateEmployeeComponent, canActivate: [authGuard]}
    ]},
    {path: 'departments', children: [
        {path: '', component: ListDepartmentComponent, canActivate: [authGuard]},
        {path: 'add', component: AddDepartmentComponent, canActivate: [authGuard]},
        {path: ':id', component: UpdateDepartmentComponent, canActivate: [authGuard]}
    ]},
    {path: 'users', children: [
        {path: ':id', component: AddUserComponent, canActivate: [authGuard]}
    ]},
    {path: 'workstations', children: [
        {path: '', component: ListWorkstationComponent, canActivate: [authGuard]},
        {path: 'add', component: AddWorkstationComponent, canActivate: [authGuard]},
        {path: ':id', component: UpdateWorkstationComponent, canActivate: [authGuard]}
    ]},
    {path: 'login', component: LoginComponent},
    {path: 'forgot-password', component: ChangePasswordComponent},
    {path: 'reports', children: [
        {path: 'employees', component: EmployeeOnboardingComponent, canActivate: [authGuard]}
    ]},
    {path: 'terms-and-conditions', component: TermsAndConditionsComponent},
    {path: 'frequent-questions', component: FrequentQuestionsComponent},
    {path: 'not-auth', component: NotFoundComponent},
    {path: '**', redirectTo: 'not-auth'},
];
