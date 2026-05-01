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
    { id: 'all',      label: 'Todas',    icon: '✨', color: '#4b47c0' },
    { id: 'trabajo',  label: 'Trabajo',  icon: '💼', color: '#ff4a00' },
    { id: 'personal', label: 'Personal', icon: '🏠', color: '#706fd3' },
    { id: 'estudio',  label: 'Estudio',  icon: '📚', color: '#00b67a' },
    { id: 'otros',    label: 'Otros',    icon: '🌟', color: '#ffb800' },
  ];

  select(id: TaskCategory | 'all') {
    this.filterChange.emit(id);
  }
}