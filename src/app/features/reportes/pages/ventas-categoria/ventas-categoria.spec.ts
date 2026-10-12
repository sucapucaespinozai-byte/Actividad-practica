import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentasCategoria } from './ventas-categoria';

describe('VentasCategoria', () => {
  let component: VentasCategoria;
  let fixture: ComponentFixture<VentasCategoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasCategoria],
    }).compileComponents();

    fixture = TestBed.createComponent(VentasCategoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
