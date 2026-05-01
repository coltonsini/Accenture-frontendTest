import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme-service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  styleUrls: ['./theme-toggle.styles.scss'],
  template: `
    <button
      class="theme-toggle"
      [class.is-dark]="theme.isDark()"
      (click)="theme.toggle()"
      [attr.aria-label]="theme.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">

      <!-- Switch track -->

      <span class="track">

        <!-- Icons  -->

        <span class="icon icon-sun" aria-hidden="true">☀️</span>
        <span class="icon icon-moon" aria-hidden="true">🌙</span>

        <span class="thumb"></span>
      </span>
    </button>
  `,
})

export class ThemeToggleComponent {
  theme = inject(ThemeService);
}
