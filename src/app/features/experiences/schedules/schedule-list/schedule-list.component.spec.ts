import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ScheduleListComponent } from './schedule-list.component';
import { environment } from '../../../../../environments/environment';
import { ScheduleResponse } from '../models/schedule.model';

const BASE_URL = `${environment.apiUrl}/experiences`;

describe('ScheduleListComponent', () => {
  let httpTesting: HttpTestingController;
  let fixture: ComponentFixture<ScheduleListComponent>;
  let router: Router;

  function setup(routeId: string | null = 'exp-1') {
    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn((key: string) => (key === 'id' ? routeId : null)),
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [ScheduleListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'experiences', children: [] },
        ]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture = TestBed.createComponent(ScheduleListComponent);
  }

  afterEach(() => {
    httpTesting.verify();
  });

  // ─── Experience existence validation ──────────────────────────────────────────

  it('redirects to /experiences when experience ID is empty', () => {
    // Validates: Requirement 6.5
    setup(null);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/experiences']);
  });

  it('redirects to /experiences when API returns 404 (experience not found)', () => {
    // Validates: Requirement 6.5
    setup('non-existent-id');
    fixture.detectChanges();

    httpTesting
      .expectOne(`${BASE_URL}/non-existent-id/schedules`)
      .flush('Not Found', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/experiences']);
  });

  it('does NOT redirect for non-404 errors', () => {
    // Validates: Requirement 1.4
    setup('exp-1');
    fixture.detectChanges();

    httpTesting
      .expectOne(`${BASE_URL}/exp-1/schedules`)
      .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.errorMessage).toBeTruthy();
  });

  it('loads schedules successfully when experience exists', () => {
    // Validates: Requirement 1.1
    setup('exp-1');
    fixture.detectChanges();

    const mockSchedules: ScheduleResponse[] = [
      { id: 'sch-1', dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '12:00', availableSlots: 5 },
    ];

    httpTesting
      .expectOne(`${BASE_URL}/exp-1/schedules`)
      .flush(mockSchedules);
    fixture.detectChanges();

    expect(fixture.componentInstance.schedules.length).toBe(1);
    expect(fixture.componentInstance.isLoading).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
