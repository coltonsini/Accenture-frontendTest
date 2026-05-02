import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon,
  AlertController, IonicSafeString
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, pencil, trash } from 'ionicons/icons';

import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./categories.styles.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonIcon,
  ],
  template: `
    <ion-header class="header-clean">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>Categorías</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="container">

        <!-- Header with creation button  -->

        <div class="page-header">
          <div>
            <h2 class="page-title">Mis categorías</h2>
            <p class="page-subtitle">{{ categoryService.count() }} categorías</p>
          </div>
          <button class="btn-create" (click)="goToCreate()">
            <ion-icon name="add"></ion-icon>
            <span>Nueva</span>
          </button>
        </div>

        <!-- Category list -->

        <div class="cat-list">
          @for (cat of categoryService.categories(); track cat.id) {
            <div class="cat-row"
                 [style.--cat-color]="cat.color"
                 [style.--cat-bg]="cat.bgColor">
              <div class="cat-info">
                <div class="cat-icon">
                  <span>{{ cat.emoji }}</span>
                </div>
                <div class="cat-text">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-meta">
                    {{ taskCount(cat.id) }} {{ taskCount(cat.id) === 1 ? 'tarea' : 'tareas' }}
                    @if (cat.isDefault) {
                      <span class="default-badge">Por defecto</span>
                    }
                  </span>
                </div>
              </div>

              <div class="cat-actions">
                <button class="action-btn" (click)="edit(cat)" aria-label="Editar">
                  <ion-icon name="pencil"></ion-icon>
                </button>
                <button class="action-btn delete-btn"
                        (click)="confirmDelete(cat)"
                        [disabled]="categoryService.count() <= 1"
                        aria-label="Eliminar">
                  <ion-icon name="trash"></ion-icon>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </ion-content>
  `,
})
export class CategoriesPage {
  categoryService = inject(CategoryService);
  taskService = inject(TaskService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  constructor() {
    addIcons({ add, pencil, trash });
  }

  taskCount(categoryId: string): number {
    return this.taskService.countByCategory(categoryId);
  }

  goToCreate() {
    this.router.navigateByUrl('/category-form');
  }

  edit(cat: Category) {
    this.router.navigateByUrl(`/category-form/${cat.id}`);
  }

  async confirmDelete(cat: Category) {
    const taskCount = this.taskCount(cat.id);

    // Principal case there's no tasks in the category → simple confirmation

    if (taskCount === 0) {
      const alert = await this.alertCtrl.create({
        header: '¿Eliminar categoría?',
        message: new IonicSafeString(
          `Vas a eliminar <strong>${this.escapeHtml(cat.name)}</strong>. Esta acción no se puede deshacer.`
        ),
        cssClass: 'delete-alert',
        buttons: [
          { text: 'Cancelar', role: 'cancel', cssClass: 'alert-btn-cancel' },
          {
            text: 'Eliminar',
            role: 'destructive',
            cssClass: 'alert-btn-delete',
            handler: () => this.categoryService.delete(cat.id),
          },
        ],
      });
      await alert.present();
      return;
    }

    // Second case, there are tasks assigned to the category → ask what to do with them (delete/move)

    const otherCategories = this.categoryService.categories().filter(c => c.id !== cat.id);

    const alert = await this.alertCtrl.create({
      header: '¿Qué hacer con las tareas?',
      message: new IonicSafeString(
        `<strong>${this.escapeHtml(cat.name)}</strong> tiene ${taskCount} ${taskCount === 1 ? 'tarea' : 'tareas'}. ¿Qué deseas hacer?`
      ),
      cssClass: 'delete-alert',
      inputs: otherCategories.map(c => ({
        type: 'radio' as const,
        label: `${c.emoji} Mover a "${c.name}"`,
        value: c.id,
        checked: false,
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel', cssClass: 'alert-btn-cancel' },
        {
          text: 'Eliminar todo',
          role: 'destructive',
          cssClass: 'alert-btn-delete',
          handler: async () => {
            await this.taskService.deleteByCategory(cat.id);
            await this.categoryService.delete(cat.id);
          },
        },
        {
          text: 'Mover y eliminar',
          cssClass: 'alert-btn-primary',
          handler: async (selectedId: string) => {
            if (!selectedId) {
              return false;
            }
            await this.taskService.reassignCategory(cat.id, selectedId);
            await this.categoryService.delete(cat.id);
            return true;
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