import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskCategory } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { FeatureFlagService } from '../../services/feature-flag.service';
import { AlertController, IonicSafeString } from '@ionic/angular/standalone';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';


interface CategoryStyle {
  emoji: string;
  label: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-task-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  styleUrls: ['./task-item.styles.scss'],
  template: `
    <article class="card" [class.completed]="task.completed">
      <header class="card-header">
        <span class="badge"
              [style.--badge-color]="categoryStyle.color"
              [style.--badge-bg]="categoryStyle.bgColor">
          <span class="badge-emoji">{{ categoryStyle.emoji }}</span>
          <span class="badge-text">{{ categoryStyle.name }}</span>
        </span>

        <div class="card-actions">

          <!-- Edit button -->

          <button class="action-btn edit-btn" (click)="edit($event)" aria-label="Editar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>

          <!-- Erase button -->

          <button class="action-btn delete-btn" (click)="delete($event)" aria-label="Eliminar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
            </svg>
          </button>
        </div>
      </header>


      <div class="card-body">
        <h3 class="title">{{ task.title }}</h3>
        @if (task.description && featureFlags.isEnabled('enableTaskDescription')) {
          <p class="description">{{ task.description }}</p>
        }
      </div>

      <footer class="card-footer">
        <time class="date">{{ formattedDate }}</time>

        <button class="check-btn"
                [class.checked]="task.completed"
                (click)="toggle()"
                [attr.aria-label]="task.completed ? 'Marcar como pendiente' : 'Marcar como completada'">
          @if (task.completed) {
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Hecho</span>
          } @else {
            <span>Completar</span>
          }
        </button>
      </footer>
    </article>
  `,
})

export class TaskItemComponent {
  @Input({ required: true }) task!: Task;

  private taskService = inject(TaskService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  featureFlags = inject(FeatureFlagService);

  private categoryMap: Record<TaskCategory, CategoryStyle> = {
    trabajo:  { emoji: '💼', label: 'Trabajo',  color: 'var(--color-cat-trabajo)',  bg: 'var(--color-cat-trabajo-bg)' },
    personal: { emoji: '🏠', label: 'Personal', color: 'var(--color-cat-personal)', bg: 'var(--color-cat-personal-bg)' },
    estudio:  { emoji: '📚', label: 'Estudio',  color: 'var(--color-cat-estudio)',  bg: 'var(--color-cat-estudio-bg)' },
    otros:    { emoji: '🌟', label: 'Otros',    color: 'var(--color-cat-otros)',    bg: 'var(--color-cat-otros-bg)' },
  };

  get categoryStyle() {
    const cat = this.categoryService.getById(this.task.category);

    // Fallback if the category is missing (e.g. deleted)

    return cat ?? {
      emoji: '❓',
      name: 'Sin categoría',
      color: '#999999',
      bgColor: '#f0f0f0',
    };
  }

  get formattedDate(): string {
    const date = new Date(this.task.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }

  toggle() {
    this.taskService.toggleComplete(this.task.id);
  }

  edit(event: Event) {
      event.stopPropagation();
      this.router.navigateByUrl(`/task-form/${this.task.id}`);
  }

  async delete(event: Event) {
    event.stopPropagation();

    const alert = await this.alertCtrl.create({
      header: '¿Eliminar tarea?',
      message: new IonicSafeString(
        `Esta acción no se puede deshacer.<br><strong>"${this.escapeHtml(this.task.title)}"</strong>`
      ),
      cssClass: 'delete-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-btn-cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-btn-delete',
          handler: () => {
            this.taskService.deleteTask(this.task.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

}