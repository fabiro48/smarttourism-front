import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Cross-field validator applied at the FormGroup level.
 * Validates that the endTime field value is strictly greater than the startTime field value.
 * String comparison works correctly for HH:mm 24-hour format.
 *
 * Returns `{ timeRange: true }` error when endTime <= startTime.
 */
export function timeRangeValidator(control: AbstractControl): ValidationErrors | null {
  const startTime = control.get('startTime')?.value;
  const endTime = control.get('endTime')?.value;

  if (!startTime || !endTime) {
    return null;
  }

  if (endTime <= startTime) {
    return { timeRange: true };
  }

  return null;
}

/**
 * Validator for the availableSlots field.
 * Validates that the value is an integer between 1 and 1000 (inclusive).
 *
 * Returns `{ availableSlots: true }` error when the value is not a valid integer
 * or falls outside the [1, 1000] range.
 */
export function availableSlotsValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numValue = Number(value);

  if (!Number.isInteger(numValue) || numValue < 1 || numValue > 1000) {
    return { availableSlots: true };
  }

  return null;
}
