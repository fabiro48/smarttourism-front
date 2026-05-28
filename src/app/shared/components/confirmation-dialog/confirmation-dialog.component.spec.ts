import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let component: ConfirmationDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
    });

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // ─── Visibility ──────────────────────────────────────────────────────────────

  describe('visibilidad', () => {
    it('no debe renderizar el diálogo cuando visible es false', () => {
      // Validates: Requirements 4.1
      component.visible = false;
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
      expect(overlay).toBeNull();
    });

    it('debe renderizar el diálogo cuando visible es true', () => {
      // Validates: Requirements 4.1
      component.visible = true;
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
      expect(overlay).not.toBeNull();
    });
  });

  // ─── Content ─────────────────────────────────────────────────────────────────

  describe('contenido', () => {
    beforeEach(() => {
      component.visible = true;
      component.title = 'Eliminar horario';
      component.message = '¿Está seguro de eliminar este horario?';
      component.confirmLabel = 'Eliminar';
      fixture.detectChanges();
    });

    it('debe mostrar el título proporcionado', () => {
      // Validates: Requirements 4.1
      const title = fixture.nativeElement.querySelector('.dialog-title');
      expect(title?.textContent?.trim()).toBe('Eliminar horario');
    });

    it('debe mostrar el mensaje proporcionado', () => {
      // Validates: Requirements 4.1
      const message = fixture.nativeElement.querySelector('.dialog-message');
      expect(message?.textContent?.trim()).toBe('¿Está seguro de eliminar este horario?');
    });

    it('debe mostrar la etiqueta de confirmación proporcionada', () => {
      // Validates: Requirements 4.1
      const confirmBtn = fixture.nativeElement.querySelector('.btn-danger');
      expect(confirmBtn?.textContent?.trim()).toBe('Eliminar');
    });
  });

  // ─── Event emission ──────────────────────────────────────────────────────────

  describe('emisión de eventos', () => {
    beforeEach(() => {
      component.visible = true;
      fixture.detectChanges();
    });

    it('debe emitir confirmed al hacer clic en el botón de confirmar', () => {
      // Validates: Requirements 4.1, 4.3
      const spy = vi.fn();
      component.confirmed.subscribe(spy);

      const confirmBtn = fixture.nativeElement.querySelector('.btn-danger');
      confirmBtn.click();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('debe emitir cancelled al hacer clic en el botón de cancelar', () => {
      // Validates: Requirements 4.5
      const spy = vi.fn();
      component.cancelled.subscribe(spy);

      const cancelBtn = fixture.nativeElement.querySelector('.btn-secondary');
      cancelBtn.click();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('debe emitir cancelled al hacer clic en el overlay', () => {
      // Validates: Requirements 4.5
      const spy = vi.fn();
      component.cancelled.subscribe(spy);

      const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
      overlay.click();

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Processing state ────────────────────────────────────────────────────────

  describe('estado de procesamiento', () => {
    beforeEach(() => {
      component.visible = true;
      component.isProcessing = true;
      fixture.detectChanges();
    });

    it('debe deshabilitar el botón de confirmar cuando isProcessing es true', () => {
      // Validates: Requirements 4.3
      const confirmBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-danger');
      expect(confirmBtn.disabled).toBe(true);
    });

    it('debe deshabilitar el botón de cancelar cuando isProcessing es true', () => {
      // Validates: Requirements 4.3
      const cancelBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-secondary');
      expect(cancelBtn.disabled).toBe(true);
    });

    it('no debe emitir confirmed cuando isProcessing es true', () => {
      // Validates: Requirements 4.3
      const spy = vi.fn();
      component.confirmed.subscribe(spy);

      component.onConfirm();

      expect(spy).not.toHaveBeenCalled();
    });

    it('no debe emitir cancelled cuando isProcessing es true', () => {
      // Validates: Requirements 4.3
      const spy = vi.fn();
      component.cancelled.subscribe(spy);

      component.onCancel();

      expect(spy).not.toHaveBeenCalled();
    });

    it('debe mostrar el spinner cuando isProcessing es true', () => {
      // Validates: Requirements 4.3
      const spinner = fixture.nativeElement.querySelector('.spinner-border');
      expect(spinner).not.toBeNull();
    });
  });

  // ─── Default values ──────────────────────────────────────────────────────────

  describe('valores por defecto', () => {
    it('debe tener título por defecto', () => {
      expect(component.title).toBe('Confirmar acción');
    });

    it('debe tener mensaje por defecto', () => {
      expect(component.message).toBe('¿Está seguro de que desea continuar?');
    });

    it('debe tener etiqueta de confirmación por defecto', () => {
      expect(component.confirmLabel).toBe('Confirmar');
    });

    it('debe tener isProcessing en false por defecto', () => {
      expect(component.isProcessing).toBe(false);
    });

    it('debe tener visible en false por defecto', () => {
      expect(component.visible).toBe(false);
    });
  });
});
