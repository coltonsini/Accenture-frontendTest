import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  readonly flags = signal<Record<string, boolean>>({
    enableDarkMode: false,
    enableTaskDescription: true,
    enableStatistics: false,
  });

  private loaded = false;

  async loadFlags() {
    if (this.loaded) return;

    try {
      const { initializeApp } = await import('firebase/app');
      const {
        getRemoteConfig,
        fetchAndActivate,
        getValue,
      } = await import('firebase/remote-config');

      const app = initializeApp(environment.firebaseConfig);
      const remoteConfig = getRemoteConfig(app);

      // Defaults
      remoteConfig.defaultConfig = {
        enableDarkMode: false,
        enableTaskDescription: true,
        enableStatistics: false,
      };

      // Dynamic fetch intervals
      remoteConfig.settings.minimumFetchIntervalMillis = environment.production
        ? 3600000  
        : 0;       

      remoteConfig.settings.fetchTimeoutMillis = 10000;

      await fetchAndActivate(remoteConfig);

      this.flags.set({
        enableDarkMode: getValue(remoteConfig, 'enableDarkMode').asBoolean(),
        enableTaskDescription: getValue(remoteConfig, 'enableTaskDescription').asBoolean(),
        enableStatistics: getValue(remoteConfig, 'enableStatistics').asBoolean(),
      });
      this.loaded = true;
    } catch (err) {
      console.error('Error cargando feature flags', err);
    }
  }

  async refreshFlags() {
    this.loaded = false;
    await this.loadFlags();
  }

  isEnabled(flag: string): boolean {
    return !!this.flags()[flag];
  }
}
