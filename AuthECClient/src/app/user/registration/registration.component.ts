import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FirstKeyPipe } from '../../shared/pipes/first-key.pipe';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  imports: [ ReactiveFormsModule, CommonModule, FirstKeyPipe],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  constructor(private authService: AuthService, private toastr: ToastrService) {}
  private formBuilder = inject(FormBuilder);
  isSubmitted: boolean = false;

  passwordMatchValidator: ValidatorFn = (control: AbstractControl) : null => {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (password && confirmPassword && password.value != confirmPassword.value)
      confirmPassword?.setErrors({passwordMismatch: true});
    else
      confirmPassword?.setErrors(null);

    return null;
  }

  form: FormGroup = this.formBuilder.group({
    fullName : ['', Validators.required],
    email : ['', [Validators.required, Validators.email]],
    password : ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/)
    ]],
    confirmPassword : ['', Validators.required],
  }, { validators: this.passwordMatchValidator })

  
  onSubmit() {
    this.isSubmitted = true;
    this.authService.createUser(this.form.value)
    .subscribe({
      next: (res:any) => { 
        console.log(res);
        debugger;
        if (res.succeeded) {
          this.form.reset();
          this.isSubmitted = false;
          this.toastr.success('New user created!', 'Registration Successful');
        }
      },
      error: err => {
        debugger;
        if (err.error.errors) {
          err.error.errors.forEach((x: any) => {
              switch(x.code) {
                case "DuplicateUserName":
                  break;
                case "DuplicateEmail":
                  this.toastr.error('Email already exist', 'Registration Failed');
                  break;
                default:
                  this.toastr.error('Contact the developer', 'Registration Failed');
                  console.log(x);                
                  break;
              }
         }) 
        }
        else {
          console.log('error:', err);          
        }
      }
    });
    console.log(this.form.value);    
  }

  hasDisplayableError(controlName: string) : Boolean {
    const control = this.form.get(controlName);
    return Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
  }
}
