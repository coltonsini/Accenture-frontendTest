import { Injectable, signal, computed } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Task, TaskCategory } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private _tasks = signal<Task[]>([]);
  private _filter = signal<TaskCategory | 'all'>('all');

  readonly tasks = computed(() => {
    const filter = this._filter();
    const all = this._tasks();
    return filter === 'all' ? all : all.filter(t => t.category === filter);
  });

  readonly totalCount = computed(() => this._tasks().length);
  readonly completedCount = computed(() =>
    this._tasks().filter(t => t.completed).length
  );

  private readonly STORAGE_KEY = 'tasks';
  private storageReady = false;

  constructor(private storage: Storage) {
    this.init();
  }

  // Initialization of the local storage and loading of saved tasks

  private async init() {
    await this.storage.create();
    const saved = await this.storage.get(this.STORAGE_KEY);
    if (saved) this._tasks.set(saved);
    this.storageReady = true;
  }

  // Persistance of the local storage with the current tasks list

  private async persist() {
    if (!this.storageReady) return;
    await this.storage.set(this.STORAGE_KEY, this._tasks());
  }

  // ---- CRUD ----

  async addTask(title: string, category: TaskCategory, description?: string) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      category,
      completed: false,
      createdAt: Date.now(),
    };

    this._tasks.update(list => [newTask, ...list]);
    await this.persist();
  }

  async toggleComplete(id: string) {
    this._tasks.update(list =>
      list.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
    await this.persist();
  }

  async deleteTask(id: string) {
    this._tasks.update(list => list.filter(t => t.id !== id));
    await this.persist();
  }

  setFilter(category: TaskCategory | 'all') {
    this._filter.set(category);
  }

  getTask(id: string): Task | undefined {
    return this._tasks().find(t => t.id === id);
  }

  async updateTask(
    id: string,
    changes: Partial<Pick<Task, 'title' | 'description' | 'category'>>
  ) {
    this._tasks.update(list =>
      list.map(t => t.id === id ? { ...t, ...changes } : t)
    );
    await this.persist();
  }

}