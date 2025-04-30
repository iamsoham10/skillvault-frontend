import { Component, inject, OnDestroy, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmailService } from '../../../services/email.service';
import { InputOtp } from 'primeng/inputotp';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Button } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp-section',
  imports: [
    FormsModule,
    InputOtp,
    Button,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    CommonModule,
  ],
  templateUrl: './otp-section.component.html',
})
export class OtpSectionComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private otpService = inject(EmailService);
  private authService = inject(AuthService);
  private router = inject(Router);

  email = this.otpService.email;
  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6)]],
  });

  otpFormState = signal({ otp: '' });
  isOtpLoading = signal(false);
  private otpFormSubmission = this.otpForm.valueChanges.subscribe(
    (otpFormValue) => {
      this.otpFormState.set(otpFormValue);
      console.log(otpFormValue);
    }
  );

  onOtpSubmit() {
    if (this.otpForm.valid) {
      this.isOtpLoading.set(true);
      const otpValidationObject = {
        email: this.email(),
        otp: this.otpForm.value.otp,
      };
      console.log(this.otpForm.value.otp);
      this.authService.otp(otpValidationObject).subscribe({
        next: (response) => {
          console.log(response);
          this.isOtpLoading.set(false);
        },
        error: (err) => {
          console.log(err);
          this.isOtpLoading.set(false);
        },
      });
    }
  }
  ngOnDestroy() {
    this.otpFormSubmission.unsubscribe();
  }
}
