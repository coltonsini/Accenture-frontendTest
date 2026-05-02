import { Injectable, computed, inject, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Category, DEFAULT_CATEGORIES } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private storage = inject(Storage);
  private readonly STORAGE_KEY = 'categories';

  private _categories = signal<Category[]>([]);

  readonly categories = computed(() => this._categories());
  readonly count = computed(() => this._categories().length);

  constructor() {
    this.init();
  }

  private async init() {
    await this.storage.create();
    const saved = await this.storage.get(this.STORAGE_KEY) as Category[] | null;

    if (saved && saved.length > 0) {
      this._categories.set(saved);
    } else {
      this._categories.set(DEFAULT_CATEGORIES);
      await this.persist();
    }
  }

  getById(id: string): Category | undefined {
    return this._categories().find(c => c.id === id);
  }

  async create(data: Omit<Category, 'id' | 'isDefault'>): Promise<Category> {
    const newCategory: Category = {
      id: this.generateId(),
      ...data,
      isDefault: false,
    };
    this._categories.update(list => [...list, newCategory]);
    await this.persist();
    return newCategory;
  }

  async update(id: string, changes: Partial<Omit<Category, 'id' | 'isDefault'>>) {
    this._categories.update(list =>
      list.map(c => c.id === id ? { ...c, ...changes } : c)
    );
    await this.persist();
  }

  async delete(id: string) {
    this._categories.update(list => list.filter(c => c.id !== id));
    await this.persist();
  }

  private async persist() {
    await this.storage.set(this.STORAGE_KEY, this._categories());
  }

  private generateId(): string {
    return 'cat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
}