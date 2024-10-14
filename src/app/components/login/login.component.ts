import { Component, OnDestroy, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from "../header/header.component";
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HeaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  loginForm: FormGroup;

  isAuthenticated: boolean = false;

  private $destroy = new Subject<void>();

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.authService.isAuthenticated
      .pipe(takeUntil(this.$destroy))
      .subscribe((value) => {
        if (value) {
          this.isAuthenticated = true;
        } else {
          this.isAuthenticated = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  login() {
    if (!this.isAuthenticated) {
      if (this.loginForm.valid) {
        const { email, password } = this.loginForm.value;
        this.authService
          .login(email, password)
          .then(() => {
            this.router.navigate(['/admin']);
          })
          .catch((error) => {
            console.error(error);
            this.toastr.error(
              'Please try again later',
              'Something went wrong'
            );
          });
      }
    } else {
      this.toastr.error('You are already logged in', 'Something went wrong');
    }
  }
}
