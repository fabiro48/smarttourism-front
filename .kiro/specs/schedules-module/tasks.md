# Implementation Plan: Schedules Module

## Overview

Implement the Schedules Module as a nested feature under the experiences feature in the Angular frontend. The module provides ADMIN users with CRUD operations for managing schedules (horarios) associated with tourism experiences. Implementation follows the project's established patterns: standalone components, OnPush change detection, reactive forms, and service-based HTTP communication with Vitest for testing and fast-check for property-based tests.

## Tasks

- [x] 1. Create data models and utility functions
  - [x] 1.1 Create schedule data models and constants
    - Create `src/app/features/experiences/schedules/models/schedule.model.ts`
    - Define `DayOfWeek` type union and `DAYS_OF_WEEK` constant array
    - Define `ScheduleRequest` and `ScheduleResponse` interfaces
    - Create `sortSchedules()` pure function that sorts by day-of-week index then start time ascending
    - _Requirements: 1.1, 7.1_

  - [x] 1.2 Create schedule form validators
    - Create `src/app/features/experiences/schedules/validators/schedule-validators.ts`
    - Implement `timeRangeValidator` cross-field validator that returns error when endTime <= startTime
    - Implement available slots validation (integer, min 1, max 1000)
    - _Requirements: 2.3, 2.4, 3.2, 5.4, 5.5_

- [x] 2. Implement SchedulesService
  - [x] 2.1 Create the SchedulesService with all CRUD methods
    - Create `src/app/features/experiences/schedules/services/schedules.service.ts`
    - Implement `getSchedules(experienceId)` returning `Observable<ScheduleResponse[]>` via GET
    - Implement `createSchedule(experienceId, request)` returning `Observable<ScheduleResponse>` via POST
    - Implement `updateSchedule(experienceId, scheduleId, request)` returning `Observable<ScheduleResponse>` via PUT
    - Implement `deleteSchedule(experienceId, scheduleId)` returning `Observable<void>` via DELETE
    - Construct URLs using `environment.apiUrl` + path segments
    - Propagate HTTP errors without transformation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 2.2 Write property test for URL construction (Property 4)
    - **Property 4: Service URL construction correctness**
    - **Validates: Requirements 7.7**
    - For any valid experienceId and optional scheduleId, verify constructed URLs match expected pattern

- [x] 3. Implement ConfirmationDialogComponent
  - [x] 3.1 Create the ConfirmationDialogComponent
    - Create `src/app/shared/components/confirmation-dialog/confirmation-dialog.component.ts`
    - Create `src/app/shared/components/confirmation-dialog/confirmation-dialog.component.html`
    - Create `src/app/shared/components/confirmation-dialog/confirmation-dialog.component.scss`
    - Implement inputs: `visible`, `title`, `message`, `confirmLabel`, `isProcessing`
    - Implement outputs: `confirmed`, `cancelled`
    - Use OnPush change detection
    - Disable confirm/cancel buttons when `isProcessing` is true
    - _Requirements: 4.1, 4.3, 4.5_

- [x] 4. Implement ScheduleListComponent
  - [x] 4.1 Create the ScheduleListComponent with loading, error, and empty states
    - Create `src/app/features/experiences/schedules/schedule-list/schedule-list.component.ts`
    - Create `src/app/features/experiences/schedules/schedule-list/schedule-list.component.html`
    - Create `src/app/features/experiences/schedules/schedule-list/schedule-list.component.scss`
    - Read `experienceId` from route params
    - Fetch schedules via SchedulesService on init
    - Apply `sortSchedules()` to the response
    - Display loading indicator while fetching
    - Display error message on API failure
    - Display empty state message when no schedules exist
    - Display schedule data: day of week, start time (HH:mm), end time (HH:mm), available slots
    - Provide create, edit, and delete action buttons
    - Use OnPush change detection
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 4.2 Implement delete flow with ConfirmationDialogComponent
    - Integrate ConfirmationDialogComponent into the list template
    - Show dialog with schedule day and time range on delete action
    - Call `deleteSchedule()` on confirm, remove schedule from list on success
    - Display error message on delete failure, keep schedule in list
    - Close dialog on cancel without changes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 4.3 Write property test for schedule sorting (Property 1)
    - **Property 1: Schedule sorting preserves day-of-week then time ordering**
    - **Validates: Requirements 1.1**
    - For any array of ScheduleResponse objects, verify sorted output maintains correct ordering

- [x] 5. Implement ScheduleFormComponent
  - [x] 5.1 Create the ScheduleFormComponent with reactive form and validation
    - Create `src/app/features/experiences/schedules/schedule-form/schedule-form.component.ts`
    - Create `src/app/features/experiences/schedules/schedule-form/schedule-form.component.html`
    - Create `src/app/features/experiences/schedules/schedule-form/schedule-form.component.scss`
    - Build reactive form with dayOfWeek, startTime, endTime, availableSlots fields
    - Apply validators: required on all fields, timeRangeValidator, slots range
    - Determine create/edit mode from route (presence of scheduleId param)
    - In edit mode, fetch existing schedule and pre-populate form
    - Disable submit button until form is valid
    - Show validation messages only after field blur
    - Use OnPush change detection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 5.2 Implement form submission with API integration and error handling
    - On valid submit in create mode, call `createSchedule()` via SchedulesService
    - On valid submit in edit mode, call `updateSchedule()` via SchedulesService
    - Disable submit button while request is in progress
    - On success, navigate back to schedule list
    - Display backend validation errors (400) adjacent to form
    - Display not-found error (404) message for edit mode
    - Display generic error message for server/network errors
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 2.9, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 5.3 Write property test for time range validation (Property 2)
    - **Property 2: Time range validation correctness**
    - **Validates: Requirements 2.3, 3.2, 5.5**
    - For any pair of HH:mm time strings, verify validator returns error iff endTime <= startTime

  - [ ]* 5.4 Write property test for available slots validation (Property 3)
    - **Property 3: Available slots range validation correctness**
    - **Validates: Requirements 2.4, 3.2, 5.4**
    - For any numeric value, verify validator accepts iff value is integer in [1, 1000]

- [x] 6. Checkpoint - Ensure all components compile and render
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Configure routing and navigation
  - [x] 7.1 Create schedules routes and integrate with experiences routes
    - Create `src/app/features/experiences/schedules/schedules.routes.ts`
    - Define routes: `''` → ScheduleListComponent, `'new'` → ScheduleFormComponent, `':scheduleId/edit'` → ScheduleFormComponent
    - Protect all routes with `adminGuard`
    - Add lazy-loaded child route `:id/schedules` in `experiences.routes.ts`
    - Include experienceId as route parameter
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 7.2 Add schedule management navigation from experience detail
    - Add a "Manage Schedules" button/link in the ExperienceDetailComponent template
    - Show the button only when the current user has the ADMIN role
    - Navigate to `/experiences/:id/schedules` on click
    - _Requirements: 6.1_

  - [x] 7.3 Implement experience existence validation on schedule routes
    - In ScheduleListComponent or via a route resolver, verify the experience exists
    - If experience ID does not correspond to an existing experience, redirect to `/experiences`
    - _Requirements: 6.5_

- [x] 8. Final checkpoint - Ensure all tests pass and module is fully integrated
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 9. Write unit tests for components and service
  - [ ]* 9.1 Write unit tests for SchedulesService
    - Mock HttpClient, verify correct URLs, HTTP methods, and payloads for each operation
    - Test error propagation behavior
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

  - [ ]* 9.2 Write unit tests for ScheduleListComponent
    - Test loading, error, and empty states
    - Test sorting output display
    - Test delete flow with confirmation dialog
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 4.4, 4.5, 4.6_

  - [ ]* 9.3 Write unit tests for ScheduleFormComponent
    - Test form initialization in create vs edit mode
    - Test validation states and messages
    - Test submission flow and error display
    - _Requirements: 2.1, 2.6, 2.8, 3.1, 3.4, 5.6, 5.7_

  - [ ]* 9.4 Write unit tests for ConfirmationDialogComponent
    - Test visibility toggle, event emission, disabled state during processing
    - _Requirements: 4.1, 4.3, 4.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- The project uses Vitest as the test runner and fast-check for property-based tests
- All components use standalone pattern (no NgModule) and OnPush change detection
- The ConfirmationDialogComponent is placed in `shared/` for reusability across features

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "3.1"] },
    { "id": 1, "tasks": ["2.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "4.2", "5.2"] },
    { "id": 3, "tasks": ["4.3", "5.3", "5.4"] },
    { "id": 4, "tasks": ["7.1", "7.2"] },
    { "id": 5, "tasks": ["7.3"] },
    { "id": 6, "tasks": ["9.1", "9.2", "9.3", "9.4"] }
  ]
}
```
