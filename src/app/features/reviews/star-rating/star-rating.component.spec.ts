import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let component: StarRatingComponent;
  let fixture: ComponentFixture<StarRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarRatingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
  });

  // ─── Renderizado básico ──────────────────────────────────────────────────────

  it('renderiza exactamente 5 botones de estrella', () => {
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button.star');
    expect(buttons.length).toBe(5);
  });

  // ─── P1 — Consistencia visual de estrellas (PBT) ────────────────────────────

  describe('P1 — Consistencia visual: estrellas llenas = rating', () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      it(`para rating=${rating}, el número de estrellas con clase .filled es ${rating}`, () => {
        component.rating = rating;
        component.hoverRating = 0;
        fixture.detectChanges();

        const filled = fixture.nativeElement.querySelectorAll('button.star.filled');
        expect(filled.length).toBe(rating);
      });
    }
  });

  // ─── Click en modo interactivo ───────────────────────────────────────────────

  it('click en modo interactivo emite el valor correspondiente', () => {
    component.readonly = false;
    fixture.detectChanges();

    let emittedValue: number | undefined;
    component.ratingChange.subscribe((v: number) => (emittedValue = v));

    const buttons = fixture.nativeElement.querySelectorAll('button.star');
    buttons[2].click(); // tercera estrella → valor 3
    fixture.detectChanges();

    expect(emittedValue).toBe(3);
    expect(component.rating).toBe(3);
  });

  // ─── Click en modo readonly ──────────────────────────────────────────────────

  it('click en modo readonly NO emite ningún evento', () => {
    component.readonly = true;
    component.rating = 2;
    fixture.detectChanges();

    let emitted = false;
    component.ratingChange.subscribe(() => (emitted = true));

    const buttons = fixture.nativeElement.querySelectorAll('button.star');
    buttons[3].click(); // cuarta estrella

    expect(emitted).toBe(false);
    expect(component.rating).toBe(2); // no cambia
  });

  // ─── Navegación por teclado ──────────────────────────────────────────────────

  describe('Navegación por teclado', () => {
    beforeEach(() => {
      component.readonly = false;
      component.rating = 3;
      fixture.detectChanges();
    });

    it('ArrowRight incrementa la selección', () => {
      let emittedValue: number | undefined;
      component.ratingChange.subscribe((v: number) => (emittedValue = v));

      component.onArrowRight();

      expect(component.rating).toBe(4);
      expect(emittedValue).toBe(4);
    });

    it('ArrowLeft decrementa la selección', () => {
      let emittedValue: number | undefined;
      component.ratingChange.subscribe((v: number) => (emittedValue = v));

      component.onArrowLeft();

      expect(component.rating).toBe(2);
      expect(emittedValue).toBe(2);
    });

    it('ArrowRight no supera el máximo de 5', () => {
      component.rating = 5;

      component.onArrowRight();

      expect(component.rating).toBe(5);
    });

    it('ArrowLeft no baja de 1', () => {
      component.rating = 1;

      component.onArrowLeft();

      expect(component.rating).toBe(1);
    });
  });
});
