import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ScheduleRequest, ScheduleResponse } from '../models/schedule.model';

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getSchedules(experienceId: string): Observable<ScheduleResponse[]> {
    return this.http.get<ScheduleResponse[]>(
      `${this.baseUrl}/experiences/${experienceId}/schedules`
    );
  }

  createSchedule(experienceId: string, request: ScheduleRequest): Observable<ScheduleResponse> {
    return this.http.post<ScheduleResponse>(
      `${this.baseUrl}/experiences/${experienceId}/schedules`,
      request
    );
  }

  updateSchedule(experienceId: string, scheduleId: string, request: ScheduleRequest): Observable<ScheduleResponse> {
    return this.http.put<ScheduleResponse>(
      `${this.baseUrl}/experiences/${experienceId}/schedules/${scheduleId}`,
      request
    );
  }

  deleteSchedule(experienceId: string, scheduleId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/experiences/${experienceId}/schedules/${scheduleId}`
    );
  }
}
