import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationComponent } from './registration/registration.component';



@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    RegistrationComponent,
    LoginComponent // Uvezite samostalnu komponentu ovdje
  ],
  exports: [
    LoginComponent
  ]
})
export class AuthModule { }
