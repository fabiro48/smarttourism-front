import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminUsersService } from '../services/admin-users.service';
import { UserResponse } from '../models/user-admin.model';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent implements OnInit {
  private adminUsersService = inject(AdminUsersService);
  private cdr = inject(ChangeDetectorRef);

  users: UserResponse[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;

  // Estado del diálogo de confirmación
  showDialog = false;
  dialogTitle = '';
  dialogMessage = '';
  isProcessing = false;
  selectedUser: UserResponse | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminUsersService
      .getUsers(this.currentPage, this.pageSize)
      .subscribe({
        next: (page) => {
          this.users = page.content;
          this.totalPages = page.totalPages;
          this.totalElements = page.totalElements;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Error al cargar los usuarios. Intenta de nuevo más tarde';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onNextPage(): void {
    this.currentPage++;
    this.loadUsers();
  }

  onPrevPage(): void {
    this.currentPage--;
    this.loadUsers();
  }

  onToggleStatus(user: UserResponse): void {
    this.selectedUser = user;
    const action = user.active ? 'Desactivar' : 'Activar';
    this.dialogTitle = `${action} usuario`;
    this.dialogMessage = `¿Está seguro de que desea ${action.toLowerCase()} al usuario ${user.fullName}?`;
    this.showDialog = true;
    this.cdr.markForCheck();
  }

  onConfirmToggle(): void {
    if (!this.selectedUser) return;

    this.isProcessing = true;
    this.cdr.markForCheck();

    const userId = this.selectedUser.id;
    const newActive = !this.selectedUser.active;

    this.adminUsersService.updateUserStatus(userId, newActive).subscribe({
      next: () => {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          user.active = newActive;
        }
        this.closeDialog();
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.handleStatusUpdateError(error);
      },
    });
  }

  onCancelToggle(): void {
    this.closeDialog();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      TOURIST: 'Turista',
      ADMIN: 'Administrador',
    };
    return labels[role] || role;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private handleStatusUpdateError(error: HttpErrorResponse): void {
    if (error.status === 404) {
      this.errorMessage = 'Usuario no encontrado';
    } else {
      this.errorMessage = 'Error al actualizar el estado del usuario. Intenta de nuevo más tarde';
    }
    this.showDialog = false;
    this.isProcessing = false;
    this.cdr.markForCheck();
  }

  private closeDialog(): void {
    this.showDialog = false;
    this.isProcessing = false;
    this.selectedUser = null;
  }
}
