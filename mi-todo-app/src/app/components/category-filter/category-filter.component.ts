import { Component, Output, EventEmitter, Input, ChangeDetectionStrategy, inject, computed } from '@angular/core';import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  styleUrls: ['./category-filter.styles.scss'],
  template: `
    <div class="filter-scroll">
      <div class="filter-track">
        <!-- Chip "Todas" siempre presente -->
        <button
          class="chip"
          [class.active]="active === 'all'"
          [style.--chip-color]="'#1f1f1f'"
          (click)="filterChange.emit('all')">
          <span class="chip-icon">✨</span>
          <span class="chip-label">Todas</span>
        </button>

        <!-- Chips dinámicos según categorías -->
        @for (cat of categoryService.categories(); track cat.id) {
          <button
            class="chip"
            [class.active]="active === cat.id"
            [style.--chip-color]="cat.color"
            (click)="filterChange.emit(cat.id)">
            <span class="chip-icon">{{ cat.emoji }}</span>
            <span class="chip-label">{{ cat.name }}</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class CategoryFilterComponent {
  @Input() active: string = 'all';
  @Output() filterChange = new EventEmitter<string>();

  categoryService = inject(CategoryService);
}