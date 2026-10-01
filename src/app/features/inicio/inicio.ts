import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio',
  template: `
    <div class="card">
      <h2>Bienvenido a PharmaSoft</h2>
      <p>Sistema de gestión farmacéutica. Seleccione un módulo en el menú lateral para comenzar.</p>
    </div>
  `,
  styles: [
    `
      .card {
        background: #fff;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #0f2e5c;
        margin-top: 0;
      }
    `,
  ],
})
export class Inicio {}
