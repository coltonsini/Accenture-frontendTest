import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon
} from '@ionic/angular/standalone';

import { TaskService } from '../../services/task.service';
import { FeatureFlagService } from '../../services/feature-flag.service';
import { TaskCategory } from '../../models/task.model';

interface CategoryOption {
  id: TaskCategory;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  styleUrls: ['./task.styles.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonIcon
  ],
  template: `
    <ion-header class="header-clean">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? 'Editar tarea' : 'Nueva tarea' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="form-container">
        
        <!-- Title -->

        <div class="field">
          <label class="field-label">Título <span class="required">*</span></label>
          <input
            type="text"
            class="field-input"
            [(ngModel)]="title"
            placeholder="Ej. Comprar materiales para el proyecto"
            maxlength="80" />
          <span class="field-hint">{{ title.length }}/80</span>
        </div>

        <!-- Description -->

        @if (featureFlags.isEnabled('enableTaskDescription')) {
          <div class="field">
            <label class="field-label">
              Descripción <span class="optional">(opcional)</span>
            </label>
            <textarea
              class="field-input field-textarea"
              [(ngModel)]="description"
              placeholder="Agrega más detalles sobre esta tarea..."
              rows="4"
              maxlength="300"></textarea>
            <span class="field-hint">{{ description.length }}/300</span>
          </div>
        }

        <!-- Categories -->

        <div class="field">
          <label class="field-label">Categoría</label>
          <div class="category-grid">
            @for (cat of categories; track cat.id) {
              <button
                type="button"
                class="cat-card"
                [class.selected]="category === cat.id"
                [style.--cat-color]="cat.color"
                [style.--cat-bg]="cat.bg"
                (click)="category = cat.id">
                <span class="cat-emoji">{{ cat.emoji }}</span>
                <span class="cat-label">{{ cat.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Action buttons -->

        <div class="actions">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="cancel()">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-primary"
            [disabled]="!canSave()"
            (click)="save()">
            {{ isEditMode ? 'Guardar cambios' : 'Crear tarea' }}
          </button>
        </div>
      </div>
    </ion-content>
  `,
})
export class TaskFormPage implements OnInit {
  
  // === Form State ===

  title = '';
  description = '';
  category: TaskCategory = 'personal';

  // === Edition mode state ===
  
  isEditMode = false;
  private editingId: string | null = null;

  // === Inyections ===
  
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  featureFlags = inject(FeatureFlagService);

  categories: CategoryOption[] = [
    { id: 'trabajo',  label: 'Trabajo',  emoji: '💼', color: 'var(--color-cat-trabajo)',  bg: 'var(--color-cat-trabajo-bg)' },
    { id: 'personal', label: 'Personal', emoji: '🏠', color: 'var(--color-cat-personal)', bg: 'var(--color-cat-personal-bg)' },
    { id: 'estudio',  label: 'Estudio',  emoji: '📚', color: 'var(--color-cat-estudio)',  bg: 'var(--color-cat-estudio-bg)' },
    { id: 'otros',    label: 'Otros',    emoji: '🌟', color: 'var(--color-cat-otros)',    bg: 'var(--color-cat-otros-bg)' },
  ];

  ngOnInit() {

    // Conditional to see if the route has an ID parameter, if it does, we are in edit mode
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      const task = this.taskService.getTask(id);
      if (task) {
        this.isEditMode = true;
        this.editingId = id;
        this.title = task.title;
        this.description = task.description || '';
        this.category = task.category;
      } else {

        // Invalid ID

        this.router.navigateByUrl('/home');
      }
    }
  }

  canSave(): boolean {
    return this.title.trim().length >= 2;
  }

  async save() {
    if (!this.canSave()) return;

    if (this.isEditMode && this.editingId) {
      
      // === Editing ===
      
      await this.taskService.updateTask(this.editingId, {
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        category: this.category,
      });
    } else {

      // === Creation  ===

      await this.taskService.addTask(
        this.title.trim(),
        this.category,
        this.description.trim() || undefined
      );
    }

    this.router.navigateByUrl('/home');
  }

  cancel() {
    this.router.navigateByUrl('/home');
  }
}