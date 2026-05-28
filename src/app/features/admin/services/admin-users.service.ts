import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page } from '../../reservations/models/reservation.model';
import { UserResponse } from '../models/user-admin.model';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/users`;

  /**
   * Obtiene el listado paginado de usuarios.
   */
  getUsers(page: number, size: number): Observable<Page<UserResponse>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));

    return this.http.get<Page<UserResponse>>(this.baseUrl, { params });
  }

  /**
   * Actualiza el estado activo/inactivo de un usuario.
   */
  updateUserStatus(userId: string, active: boolean): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.baseUrl}/${userId}/status`,
      { active }
    );
  }
}
