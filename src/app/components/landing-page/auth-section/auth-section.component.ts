import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { EmailService } from '../../../services/email.service';
import { OtpSectionComponent } from '../otp-section/otp-section.component';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-auth-section',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    PasswordModule,
    ProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    OtpSectionComponent,
  ],
  templateUrl: './auth-section.component.html',
  styleUrl: './auth-section.component.css',
})
export class AuthSectionComponent implements OnDestroy {
  visible = false;
  isLoginMode = true;

  showDialog(): void {
    this.visible = true;
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    if (!this.isLoginMode)
      alert('please make sure you enter your own email id');
  }

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private emailService = inject(EmailService);
  private userService = inject(UserService);

  // login form
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  loginFormState = signal({ email: '', password: '' }); // signal for login form state
  loginLoading = signal(false);
  loginErrorMessage = signal<string | null>(null);

  // subscribe to login form changes and update the signal
  private loginFormSubmission = this.loginForm.valueChanges.subscribe(
    (loginFormValue) => {
      this.loginFormState.set(loginFormValue);
      console.log(this.loginFormState());
    }
  );

  onLoginSubmit() {
    if (this.loginForm.valid) {
      this.loginLoading.set(true);
      this.loginErrorMessage.set(null);
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log(response);
          this.userService.setUserID(response.data.user._id);
          this.loginLoading.set(false);
        },
        error: (err) => {
          this.loginErrorMessage.set(err.message);
          this.loginLoading.set(false);
          console.log(err);
        },
        complete: () => {
          this.loginLoading.set(false);
        },
      });
    }
  }

  // sign up form
  signUpForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  signUpFormState = signal({ username: '', email: '', password: '' }); // signal for sign up form state

  private signUpFormSubmission = this.signUpForm.valueChanges.subscribe(
    (signUpFormValue) => {
      this.signUpFormState.set(signUpFormValue);
      console.log(this.signUpFormState());
    }
  );
  signUpLoading = signal(false);
  signUpErrorMessage = signal<string | null>(null);
  showOtpForm = false;

  onSignUpSubmit() {
    if (this.signUpForm.valid) {
      this.signUpLoading.set(true);
      this.signUpErrorMessage.set(null);
      this.emailService.setEmail(this.signUpForm.value.email);
      this.authService.signUp(this.signUpForm.value).subscribe({
        next: (response) => {
          console.log(response);
          this.showOtpForm = true;
          this.signUpLoading.set(false);
        },
        error: (err) => {
          this.signUpErrorMessage.set(err.message);
          this.signUpLoading.set(false);
          console.log(err);
        },
        complete: () => {
          this.signUpLoading.set(false);
        },
      });
    }
  }

  ngOnDestroy() {
    this.loginFormSubmission.unsubscribe();
    this.signUpFormSubmission.unsubscribe();
  }
}
