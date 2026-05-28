import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ExperienceCardComponent } from './experience-card.component';
import { ExperienceResponse } from '../models/experience.model';

/** Stub mínimo de ExperienceResponse para usar en tests */
const mockExperience: ExperienceResponse = {
  id: 'exp-1',
  title: 'Senderismo en el Chicamocha',
  description: 'Una experiencia increíble en el cañón',
  category: 'Aventura',
  location: 'Santander',
  duration: 180,
  difficulty: 'MODERATE',
  price: 150000,
  images: ['https://example.com/img.jpg'],
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  averageRating: 4.5,
  reviewCount: 10,
  schedules: [],
};

describe('ExperienceCardComponent', () => {
  async function createComponent(
    experience: ExperienceResponse = mockExperience,
    isAdmin = false,
  ) {
    await TestBed.configureTestingModule({
      imports: [ExperienceCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExperienceCardComponent);
    fixture.componentInstance.experience = experience;
    fixture.componentInstance.isAdmin = isAdmin;
    fixture.detectChanges();
    return fixture;
  }

  // ─── Req 11.1 — Renderiza campos básicos ─────────────────────────────────────

  it('renderiza título, categoría, ubicación y precio correctamente', async () => {
    // Validates: Requirement 11.1
    const fixture = await createComponent();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Senderismo en el Chicamocha');
    expect(el.querySelector('.category')?.textContent?.trim()).toBe('Aventura');
    expect(el.querySelector('.location')?.textContent).toContain('Santander');
    // El precio formateado en COP debe contener el valor numérico
    expect(el.querySelector('.price')?.textContent).toContain('150');
  });

  // ─── Req 11.2 — "Sin reseñas" cuando averageRating es null ───────────────────

  it('muestra "Sin reseñas" cuando averageRating es null', async () => {
    // Validates: Requirement 11.2
    const exp: ExperienceResponse = { ...mockExperience, averageRating: null };
    const fixture = await createComponent(exp);
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.rating')?.textContent?.trim()).toBe('Sin reseñas');
  });

  // ─── Req 11.3 — Placeholder cuando images está vacío ─────────────────────────

  it('muestra el placeholder cuando la lista de imágenes está vacía', async () => {
    // Validates: Requirement 11.3
    const exp: ExperienceResponse = { ...mockExperience, images: [] };
    const fixture = await createComponent(exp);
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.img-placeholder')).not.toBeNull();
    expect(el.querySelector('img')).toBeNull();
  });

  // ─── Req 11.4 — Click navega a /experiences/{id} ─────────────────────────────

  it('al hacer clic en la tarjeta navega a /experiences/{id}', async () => {
    // Validates: Requirement 11.4
    const fixture = await createComponent();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const article: HTMLElement = fixture.nativeElement.querySelector('article');
    article.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/experiences', 'exp-1']);
  });

  // ─── Botones ADMIN visibles cuando isAdmin = true ────────────────────────────

  it('muestra botones de admin cuando isAdmin es true', async () => {
    // Validates: Requirement 8.2
    const fixture = await createComponent(mockExperience, true);
    const el: HTMLElement = fixture.nativeElement;

    const buttons = el.querySelectorAll('.admin-actions button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent?.trim()).toBe('Editar');
    expect(buttons[1].textContent?.trim()).toBe('Desactivar');
  });

  it('no muestra botones de admin cuando isAdmin es false', async () => {
    // Validates: Requirement 8.2
    const fixture = await createComponent(mockExperience, false);
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.admin-actions')).toBeNull();
  });
});

// ─── P3 — Formato de calificación ────────────────────────────────────────────
/**
 * P3 — Formato de calificación (ExperienceCardComponent):
 * Para cualquier averageRating ∈ [0.0, 5.0], el texto mostrado en el DOM
 * es averageRating redondeado a exactamente 1 decimal.
 *
 * **Validates: Requirements 11.5**
 */
describe('P3 — Formato de calificación (ExperienceCardComponent)', () => {
  async function createComponentWithRating(rating: number) {
    await TestBed.configureTestingModule({
      imports: [ExperienceCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExperienceCardComponent);
    fixture.componentInstance.experience = { ...mockExperience, averageRating: rating };
    fixture.componentInstance.isAdmin = false;
    fixture.detectChanges();
    return fixture;
  }

  /**
   * Valores representativos en [0, 5]: límite inferior, valor con redondeo
   * no trivial y límite superior.
   */
  const ratingCases: number[] = [0, 2.34, 5.0];

  for (const rating of ratingCases) {
    it(`averageRating=${rating} → muestra valor redondeado a 1 decimal`, async () => {
      const fixture = await createComponentWithRating(rating);
      const el: HTMLElement = fixture.nativeElement;
      const ratingEl = el.querySelector('.rating');

      expect(ratingEl).not.toBeNull();

      // El texto del elemento debe contener el valor formateado a 1 decimal
      // Angular's DecimalPipe with '1.1-1' rounds to 1 decimal place
      const expectedFormatted = rating.toLocaleString('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

      expect(ratingEl?.textContent).toContain(expectedFormatted);
    });
  }
});
