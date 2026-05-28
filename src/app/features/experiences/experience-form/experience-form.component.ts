import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExperiencesService } from '../services/experiences.service';
import { ExperienceRequest, Difficulty } from '../models/experience.model';

@Component({
  selector: 'app-experience-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './experience-form.component.html',
  styleUrl: './experience-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private experiencesService = inject(ExperiencesService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  mode: 'create' | 'edit' = 'create';
  experienceId: string | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

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

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      this.experienceId = id;
      this.loadExperience(id);
    }
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
    });
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
        });
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
    };
  }
}
