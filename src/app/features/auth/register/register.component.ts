import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    documentNumber: ['', [Validators.required, Validators.minLength(5)]]
  });

  isLoading = false;
  errorMessage = '';

  get fullName() { return this.form.get('fullName')!; }
  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
  get phone() { return this.form.get('phone')!; }
  get documentNumber() { return this.form.get('documentNumber')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { fullName, email, password, phone, documentNumber } = this.form.value;

    this.authService.registerHttp(fullName, email, password, phone, documentNumber).subscribe({
      next: (res) => {
        this.authService.login(res.token);
        this.router.navigate(['/experiences']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'Este email ya está registrado';
        } else if (err.status === 400) {
          this.errorMessage = 'Datos inválidos. Verifica los campos';
        } else {
          this.errorMessage = 'Error de conexión. Intenta de nuevo más tarde';
        }
      }
    });
  }
}
