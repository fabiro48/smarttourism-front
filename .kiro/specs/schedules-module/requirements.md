# Requirements Document

## Introduction

The Schedules Module provides ADMIN users with a frontend interface to manage schedules (horarios) for tourism experiences in the Smart Tourism application. The module integrates with the existing backend REST API at `/api/v1/experiences/{experienceId}/schedules` and allows administrators to create, view, edit, and deactivate schedules directly from the experience detail view. The module follows Angular standalone component patterns with OnPush change detection and reactive forms.

## Glossary

- **Schedules_Module**: The Angular feature module responsible for schedule CRUD operations within the experience context
- **Schedule_Form**: The reactive form component used for creating and editing schedules
- **Schedule_List**: The component that displays all schedules for a given experience in the admin context
- **Schedule_Service**: The Angular service that communicates with the backend schedule endpoints
- **Admin_User**: A user with the ADMIN role who has permission to manage schedules
- **Experience**: A tourism experience entity that contains zero or more schedules
- **Schedule**: A time slot associated with an experience, defined by day of week, start time, end time, and available slots
- **Day_Of_Week**: An enumeration of valid days (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY)
- **Confirmation_Dialog**: A UI element that asks the Admin_User to confirm a destructive action before execution

## Requirements

### Requirement 1: Schedule Listing

**User Story:** As an Admin_User, I want to view all schedules for an experience, so that I can understand the current availability configuration.

#### Acceptance Criteria

1. WHEN the Admin_User navigates to the schedule management view for an experience, THE Schedule_List SHALL display all active schedules retrieved from the backend API, sorted by Day_Of_Week (MONDAY first through SUNDAY last) and then by start time in ascending order
2. THE Schedule_List SHALL display the day of week, start time in HH:mm 24-hour format, end time in HH:mm 24-hour format, and available slots as an integer for each schedule
3. WHILE schedules are being loaded from the API, THE Schedule_List SHALL display a loading indicator in place of the schedule list content
4. IF the API returns an error, THEN THE Schedule_List SHALL replace the loading indicator with an error message containing the error description returned by the API response
5. IF no schedules exist for the experience, THEN THE Schedule_List SHALL display a message indicating no schedules are configured
6. WHEN the API response is received successfully, THE Schedule_List SHALL replace the loading indicator with the schedule data within 1 second of response arrival

### Requirement 2: Schedule Creation

**User Story:** As an Admin_User, I want to create a new schedule for an experience, so that I can define when the experience is available for booking.

#### Acceptance Criteria

1. WHEN the Admin_User activates the create schedule action, THE Schedule_Form SHALL display an empty form with a day of week selector limited to the Day_Of_Week enumeration values, start time field, end time field, and available slots field
2. THE Schedule_Form SHALL keep the submit button disabled until all fields (day of week, start time, end time, available slots) contain a value
3. THE Schedule_Form SHALL validate that end time is later than start time on the same day
4. THE Schedule_Form SHALL validate that available slots is an integer between 1 and 1000
5. WHEN the Admin_User submits a valid form, THE Schedule_Service SHALL send a POST request to `/api/v1/experiences/{experienceId}/schedules`
6. WHILE the POST request is in progress, THE Schedule_Form SHALL disable the submit button to prevent duplicate submissions
7. WHEN the backend returns a successful response, THE Schedule_List SHALL update to include the newly created schedule without requiring a full page reload
8. IF the backend returns a validation error, THEN THE Schedule_Form SHALL display the error message returned by the API adjacent to the form fields
9. IF the backend returns a network or server error, THEN THE Schedule_Form SHALL display an error message indicating that the schedule could not be created and the Admin_User should retry

### Requirement 3: Schedule Editing

**User Story:** As an Admin_User, I want to edit an existing schedule, so that I can adjust availability when operational needs change.

#### Acceptance Criteria

1. WHEN the Admin_User activates the edit action on a schedule, THE Schedule_Form SHALL display pre-populated with the current values of the selected schedule (day of week, start time, end time, and available slots)
2. THE Schedule_Form SHALL apply the same validation rules as schedule creation: all fields required, end time greater than start time, and available slots is a positive integer between 1 and 9999
3. WHEN the Admin_User submits a valid edited form, THE Schedule_Service SHALL send a PUT request to `/api/v1/experiences/{experienceId}/schedules/{scheduleId}` with the updated schedule payload
4. WHILE the update request is in progress, THE Schedule_Form SHALL disable the submit button to prevent duplicate submissions
5. WHEN the backend returns a successful response, THE Schedule_List SHALL update to reflect the modified schedule without requiring a full page reload
6. IF the backend returns a validation error, THEN THE Schedule_Form SHALL display the error message returned by the API
7. IF the backend returns a not-found error, THEN THE Schedule_Form SHALL display an error message indicating the schedule no longer exists
8. IF the backend returns a server error or the request fails due to a network issue, THEN THE Schedule_Form SHALL display an error message indicating the operation could not be completed

### Requirement 4: Schedule Deactivation

**User Story:** As an Admin_User, I want to deactivate a schedule, so that I can remove availability that is no longer offered.

#### Acceptance Criteria

1. WHEN the Admin_User activates the delete action on a schedule, THE Confirmation_Dialog SHALL appear displaying the schedule's day of week and time range and asking the Admin_User to confirm the deactivation
2. WHEN the Admin_User confirms the deactivation, THE Schedule_Service SHALL send a DELETE request to `/api/v1/experiences/{experienceId}/schedules/{scheduleId}`
3. WHILE the DELETE request is in progress, THE Confirmation_Dialog SHALL disable the confirm and cancel actions to prevent duplicate submissions
4. WHEN the backend returns a successful response (HTTP 204), THE Schedule_List SHALL remove the deactivated schedule from the displayed list without requiring a full page reload
5. IF the Admin_User cancels the deactivation, THEN THE Confirmation_Dialog SHALL close and THE Schedule_List SHALL remain unchanged
6. IF the backend returns an error during deactivation, THEN THE Schedule_List SHALL display an error message indicating the deactivation failed and THE Schedule_List SHALL continue to show the schedule in its original position

### Requirement 5: Form Validation

**User Story:** As an Admin_User, I want clear validation feedback on the schedule form, so that I can correct input errors before submission.

#### Acceptance Criteria

1. IF the day of week field has no day selected, THEN THE Schedule_Form SHALL mark the day of week field as invalid and display a validation message adjacent to the field
2. IF the start time field is empty, THEN THE Schedule_Form SHALL mark the start time field as invalid and display a validation message adjacent to the field
3. IF the end time field is empty, THEN THE Schedule_Form SHALL mark the end time field as invalid and display a validation message adjacent to the field
4. IF the available slots field value is not an integer between 1 and 1000, THEN THE Schedule_Form SHALL mark the available slots field as invalid and display a validation message adjacent to the field
5. WHEN end time is less than or equal to start time, THE Schedule_Form SHALL display a validation error indicating that end time must be after start time
6. THE Schedule_Form SHALL display validation messages for a field only after the Admin_User has blurred (moved focus away from) the corresponding field at least once
7. WHEN the Admin_User attempts to submit the form while any field is invalid, THE Schedule_Form SHALL display validation messages for all invalid fields and prevent submission

### Requirement 6: Navigation and Access Control

**User Story:** As an Admin_User, I want to access schedule management from the experience detail view, so that I can manage schedules in context.

#### Acceptance Criteria

1. WHEN the Admin_User views an experience detail, THE Experience_Detail SHALL display a visible link or button to navigate to the schedule management view for that experience, and this element SHALL only be displayed when the current user has the ADMIN role
2. THE Schedules_Module route SHALL be protected by the admin guard to prevent non-admin access
3. IF a non-admin user attempts to access the schedule management route, THEN THE application SHALL redirect the user to the experiences list view
4. THE Schedules_Module SHALL include the experience identifier as a route parameter in the route path to scope schedule operations to a specific experience
5. IF the experience identifier in the route does not correspond to an existing experience, THEN THE application SHALL redirect the Admin_User to the experiences list view

### Requirement 7: Schedule Service API Integration

**User Story:** As a developer, I want a dedicated service for schedule API calls, so that HTTP communication is encapsulated and testable.

#### Acceptance Criteria

1. THE Schedule_Service SHALL expose a method that accepts an experience identifier and returns an Observable emitting the array of ScheduleResponse objects retrieved from `GET /api/v1/experiences/{experienceId}/schedules`
2. THE Schedule_Service SHALL expose a method that accepts an experience identifier and a schedule request payload (day of week, start time, end time, available slots) and returns an Observable emitting the created ScheduleResponse from `POST /api/v1/experiences/{experienceId}/schedules`
3. THE Schedule_Service SHALL expose a method that accepts an experience identifier, a schedule identifier, and an updated schedule request payload, and returns an Observable emitting the updated ScheduleResponse from `PUT /api/v1/experiences/{experienceId}/schedules/{scheduleId}`
4. THE Schedule_Service SHALL expose a method that accepts an experience identifier and a schedule identifier, and returns an Observable emitting void from `DELETE /api/v1/experiences/{experienceId}/schedules/{scheduleId}`
5. THE Schedule_Service SHALL delegate authentication token injection to the application-level HTTP interceptor so that all outgoing requests include the Authorization header when a token is present
6. IF the backend returns an HTTP error response, THEN THE Schedule_Service SHALL propagate the error through the returned Observable without swallowing or transforming it, allowing calling components to handle the failure
7. THE Schedule_Service SHALL construct request URLs using the base API URL from the environment configuration concatenated with the experience and schedule path segments
