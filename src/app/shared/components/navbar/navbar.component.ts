import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private logoutSub?: Subscription;

  isAuthenticated = false;
  isAdmin = false;

  private loginSub?: Subscription;

  ngOnInit(): void {
    this.updateAuthState();
    this.logoutSub = this.authService.logout$.subscribe(() => {
      this.updateAuthState();
    });
    this.loginSub = this.authService.login$.subscribe(() => {
      this.updateAuthState();
    });
  }

  ngOnDestroy(): void {
    this.logoutSub?.unsubscribe();
    this.loginSub?.unsubscribe();
  }

  private updateAuthState(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isAdmin = this.authService.getUserRole() === 'ADMIN';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
