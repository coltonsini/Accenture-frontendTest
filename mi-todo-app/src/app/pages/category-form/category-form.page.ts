import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton
} from '@ionic/angular/standalone';

import { CategoryService } from '../../services/category.service';

const EMOJI_OPTIONS = [
  '💼', '🏠', '📚', '🌟', '🎯', '💪', '🍎', '🏥',
  '✈️', '🎨', '🎵', '🎮', '⚽', '🛒', '💡', '🔥',
  '☕', '🌱', '🐾', '📷', '🎬', '💰', '🚗', '✏️'
];

const COLOR_OPTIONS = [
  { color: '#a100ff', bgColor: '#f3e6ff' }, 
  { color: '#6f00ff', bgColor: '#ebe0ff' }, 
  { color: '#008a3c', bgColor: '#e0f2e8' },
  { color: '#ff6d00', bgColor: '#ffeede' }, 
  { color: '#d4002a', bgColor: '#ffe0e6' },
  { color: '#0077cc', bgColor: '#dceaff' },
  { color: '#ff1493', bgColor: '#ffe0ef' },
  { color: '#393939', bgColor: '#e8e8eb' },
];

@Component({
  selector: 'app-category-form',
  standalone: true,
  styleUrls: ['./category-form.styles.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton
  ],
  template: `
    <ion-header class="header-clean">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/categories" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? 'Editar categoría' : 'Nueva categoría' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="form-container">

        <!-- Category Preview -->

        <div class="preview"
             [style.--preview-color]="selectedColor"
             [style.--preview-bg]="selectedBg">
          <div class="preview-icon">{{ selectedEmoji }}</div>
          <div class="preview-name">{{ name || 'Nombre de la categoría' }}</div>
        </div>

        <!-- Name -->

        <div class="field">
          <label class="field-label">Nombre <span class="required">*</span></label>
          <input
            type="text"
            class="field-input"
            [(ngModel)]="name"
            placeholder="Ej. Salud, Finanzas, Hobbies..."
            maxlength="20" />
          <span class="field-hint">{{ name.length }}/20</span>
        </div>

        <!-- Emoji selection -->

        <div class="field">
          <label class="field-label">Icono</label>
          <div class="emoji-grid">
            @for (emoji of emojis; track emoji) {
              <button
                type="button"
                class="emoji-btn"
                [class.selected]="selectedEmoji === emoji"
                (click)="selectedEmoji = emoji">
                {{ emoji }}
              </button>
            }
          </div>
        </div>

        <!-- Color selection -->

        <div class="field">
          <label class="field-label">Color</label>
          <div class="color-grid">
            @for (option of colors; track option.color) {
              <button
                type="button"
                class="color-btn"
                [class.selected]="selectedColor === option.color"
                [style.background]="option.color"
                (click)="selectColor(option)"
                [attr.aria-label]="'Color ' + option.color">
              </button>
            }
          </div>
        </div>

        <!-- Buttons  -->

        <div class="actions">
          <button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button>
          <button type="button" class="btn btn-primary"
                  [disabled]="!canSave()"
                  (click)="save()">
            {{ isEditMode ? 'Guardar cambios' : 'Crear categoría' }}
          </button>
        </div>
      </div>
    </ion-content>
  `,
})
export class CategoryFormPage implements OnInit {
  name = '';
  selectedEmoji = '🎯';
  selectedColor = COLOR_OPTIONS[0].color;
  selectedBg = COLOR_OPTIONS[0].bgColor;

  isEditMode = false;
  private editingId: string | null = null;

  emojis = EMOJI_OPTIONS;
  colors = COLOR_OPTIONS;

  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const cat = this.categoryService.getById(id);
      if (cat) {
        this.isEditMode = true;
        this.editingId = id;
        this.name = cat.name;
        this.selectedEmoji = cat.emoji;
        this.selectedColor = cat.color;
        this.selectedBg = cat.bgColor;
      } else {
        this.router.navigateByUrl('/categories');
      }
    }
  }

  selectColor(option: { color: string; bgColor: string }) {
    this.selectedColor = option.color;
    this.selectedBg = option.bgColor;
  }

  canSave(): boolean {
    return this.name.trim().length >= 2;
  }

  async save() {
    if (!this.canSave()) return;

    if (this.isEditMode && this.editingId) {
      await this.categoryService.update(this.editingId, {
        name: this.name.trim(),
        emoji: this.selectedEmoji,
        color: this.selectedColor,
        bgColor: this.selectedBg,
      });
    } else {
      await this.categoryService.create({
        name: this.name.trim(),
        emoji: this.selectedEmoji,
        color: this.selectedColor,
        bgColor: this.selectedBg,
      });
    }
    this.router.navigateByUrl('/categories');
  }

  cancel() {
    this.router.navigateByUrl('/categories');
  }
}
