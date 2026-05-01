import { Component, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCategory } from '../../models/task.model';

interface FilterChip {
  id: TaskCategory | 'all';
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-category-filter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  styleUrls: ['./category-filter.styles.scss'],
  template: `
    <div class="filter-scroll">
      <div class="filter-track">
        @for (chip of chips; track chip.id) {
          <button
            class="chip"
            [class.active]="active === chip.id"
            [style.--chip-color]="chip.color"
            (click)="select(chip.id)">
            <span class="emoji">{{ chip.icon }}</span>
            <span class="label">{{ chip.label }}</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class CategoryFilterComponent {
  @Input() active: TaskCategory | 'all' = 'all';
  @Output() filterChange = new EventEmitter<TaskCategory | 'all'>();

  chips: FilterChip[] = [
    { id: 'all',      label: 'Todas',    icon: '✨', color: '#1f1f1f' },
    { id: 'trabajo',  label: 'Trabajo',  icon: '💼', color: '#a100ff' },
    { id: 'personal', label: 'Personal', icon: '🏠', color: '#6f00ff' },
    { id: 'estudio',  label: 'Estudio',  icon: '📚', color: '#008a3c' },
    { id: 'otros',    label: 'Otros',    icon: '🌟', color: '#ff6d00' },
  ];

  select(id: TaskCategory | 'all') {
    this.filterChange.emit(id);
  }
}