import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ExperiencesService } from '../services/experiences.service';
import { ExperienceRequest, Difficulty } from '../models/experience.model';
import { MapComponent } from '../../../shared/components/map/map.component';

@Component({
  selector: 'app-experience-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapComponent],
  templateUrl: './experience-form.component.html',
  styleUrl: './experience-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private experiencesService = inject(ExperiencesService);
  private cdr = inject(ChangeDetectorRef);

  private coordinateSubscriptions: Subscription[] = [];

  form!: FormGroup;
  mode: 'create' | 'edit' = 'create';
  experienceId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  mapLatitude = 7.1254;
  mapLongitude = -73.1198;

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }

  get title() {
    return this.form.get('title')!;
  }

  get description() {
    return this.form.get('description')!;
  }

  get category() {
    return this.form.get('category')!;
  }

  get location() {
    return this.form.get('location')!;
  }

  get duration() {
    return this.form.get('duration')!;
  }

  get difficulty() {
    return this.form.get('difficulty')!;
  }

  get price() {
    return this.form.get('price')!;
  }

  get images() {
    return this.form.get('images')!;
  }

  get latitudeControl() {
    return this.form.get('latitude')!;
  }

  get longitudeControl() {
    return this.form.get('longitude')!;
  }

  ngOnInit(): void {
    this.initForm();
    this.subscribeToCoordinateChanges();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      this.experienceId = id;
      this.loadExperience(id);
    }
  }

  ngOnDestroy(): void {
    this.coordinateSubscriptions.forEach(sub => sub.unsubscribe());
  }

  onCoordinateSelected(event: { latitude: number; longitude: number }): void {
    this.form.patchValue({
      latitude: event.latitude,
      longitude: event.longitude,
    });
    this.mapLatitude = event.latitude;
    this.mapLongitude = event.longitude;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request = this.buildRequest();

    if (this.mode === 'create') {
      this.experiencesService.createExperience(request).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/experiences']);
        },
        error: () => {
          this.errorMessage = 'Error al crear la experiencia. Intenta de nuevo más tarde';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.experiencesService.updateExperience(this.experienceId!, request).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/experiences', this.experienceId]);
        },
        error: () => {
          this.errorMessage = 'Error al actualizar la experiencia. Intenta de nuevo más tarde';
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      location: ['', [Validators.required]],
      duration: [null, [Validators.required, Validators.min(1)]],
      difficulty: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      images: [''],
      latitude: [7.1254, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [-73.1198, [Validators.required, Validators.min(-180), Validators.max(180)]],
    });
  }

  private subscribeToCoordinateChanges(): void {
    const latSub = this.form.get('latitude')!.valueChanges.subscribe(value => {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= -90 && numValue <= 90) {
        this.mapLatitude = numValue;
        this.cdr.markForCheck();
      }
    });

    const lngSub = this.form.get('longitude')!.valueChanges.subscribe(value => {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= -180 && numValue <= 180) {
        this.mapLongitude = numValue;
        this.cdr.markForCheck();
      }
    });

    this.coordinateSubscriptions.push(latSub, lngSub);
  }

  private loadExperience(id: string): void {
    this.isLoading = true;

    this.experiencesService.getExperienceById(id).subscribe({
      next: (experience) => {
        this.form.patchValue({
          title: experience.title,
          description: experience.description,
          category: experience.category,
          location: experience.location,
          duration: experience.duration,
          difficulty: experience.difficulty,
          price: experience.price,
          images: experience.images?.join(', ') ?? '',
          latitude: experience.latitude,
          longitude: experience.longitude,
        });
        this.mapLatitude = experience.latitude;
        this.mapLongitude = experience.longitude;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Error al cargar la experiencia para edición';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private buildRequest(): ExperienceRequest {
    const formValue = this.form.value;
    const imagesRaw: string = formValue.images || '';
    const imagesArray = imagesRaw
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    return {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      location: formValue.location,
      duration: formValue.duration,
      difficulty: formValue.difficulty as Difficulty,
      price: formValue.price,
      images: imagesArray,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
    };
  }
}
