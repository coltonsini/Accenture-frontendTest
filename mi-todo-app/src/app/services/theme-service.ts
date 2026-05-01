import { Injectable, signal, effect, inject } from '@angular/core';
import { FeatureFlagService } from './feature-flag.service';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'theme-preference';

  readonly mode = signal<ThemeMode>('auto');

  readonly isDark = signal<boolean>(false);

  private featureFlags = inject(FeatureFlagService);

  constructor() {

    // Save user preference for theme in localStorage and react to system changes or remote feature flags

    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (saved) this.mode.set(saved);

    // Detect changes within the app

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => this.applyTheme());

    // Effect the changes to react to the feature flags and system preferences

    effect(() => {
      this.featureFlags.flags();
      this.applyTheme();
    });
  }

  /**
   * Aplication of the theme based on user preference, system settings and remote feature flags.
  */

  private applyTheme() {
    const userMode = this.mode();
    let shouldBeDark: boolean;

    if (userMode === 'dark') {
      shouldBeDark = true;
    } else if (userMode === 'light') {
      shouldBeDark = false;
    } else {
      const flagDark = this.featureFlags.isEnabled('enableDarkMode');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      shouldBeDark = flagDark || systemDark;
    }

    this.isDark.set(shouldBeDark);
    document.body.classList.toggle('dark', shouldBeDark);
  }

  setMode(mode: ThemeMode) {
    this.mode.set(mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  toggle() {
    this.setMode(this.isDark() ? 'light' : 'dark');
  }
}
