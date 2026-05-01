import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonFab, IonFabButton, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

import { TaskService } from '../../services/task.service';
import { FeatureFlagService } from '../../services/feature-flag.service';
import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { CategoryFilterComponent } from '../../components/category-filter/category-filter.component';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { TaskCategory } from '../../models/task.model';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./home.styles.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonFab, IonFabButton, IonIcon,
    TaskItemComponent,
    CategoryFilterComponent,
    ThemeToggleComponent
  ],
  template: `
    <ion-header class="header-clean">
      <ion-toolbar>
        <div class="brand">
          <span class="brand-logo">⚡</span>
          <ion-title>Mis Tareas</ion-title>
        </div>
        <div slot="end" class="header-actions">
          @if (featureFlags.isEnabled('enableDarkMode')) {
            <app-theme-toggle />
          }
        </div>
      </ion-toolbar>


      <!-- Category Filter -->

      <app-category-filter
        [active]="currentFilter()"
        (filterChange)="onFilterChange($event)" />
    </ion-header>

    <ion-content>
      <div class="container">

        <!-- Summary  -->

        <div class="summary">
          <div class="summary-text">
            <h2 class="summary-title">{{ greeting }}</h2>
            <p class="summary-subtitle">
              Tienes <strong>{{ pendingCount() }}</strong>
              {{ pendingCount() === 1 ? 'tarea pendiente' : 'tareas pendientes' }}
            </p>
          </div>
          @if (featureFlags.isEnabled('enableStatistics')) {
            <div class="summary-stats">
              <div class="stat">
                <span class="stat-value">{{ taskService.totalCount() }}</span>
                <span class="stat-label">Total</span>
              </div>
              <div class="stat stat-success">
                <span class="stat-value">{{ taskService.completedCount() }}</span>
                <span class="stat-label">Hechas</span>
              </div>
            </div>
          }
        </div>

        <!-- Task Grid -->

        @if (taskService.tasks().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <h3>No hay tareas aquí</h3>
            <p>{{ currentFilter() === 'all'
                ? '¡Empieza creando tu primera tarea!'
                : 'No hay tareas en esta categoría' }}</p>
          </div>
        } @else {
          <div class="grid">
            @for (task of taskService.tasks(); track task.id; let i = $index) {
              <app-task-item
                [task]="task"
                [style.animation-delay.ms]="i * 50" />
            }
          </div>
        }
      </div>

      <!-- Floating button -->

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="goToCreate()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
})

export class HomePage implements OnInit {
  taskService = inject(TaskService);
  featureFlags = inject(FeatureFlagService);
  private router = inject(Router);

  currentFilter = signal<TaskCategory | 'all'>('all');

  constructor() {
    addIcons({ add });
  }

  async ngOnInit() {
    await this.featureFlags.loadFlags();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días! ☀️';
    if (hour < 19) return '¡Buenas tardes! 👋';
    return '¡Buenas noches! 🌙';
  }

  pendingCount = () => this.taskService.tasks().filter(t => !t.completed).length;

  onFilterChange(filter: TaskCategory | 'all') {
    this.currentFilter.set(filter);
    this.taskService.setFilter(filter);
  }

  goToCreate() {
    this.router.navigateByUrl('/task-form');
  }
}