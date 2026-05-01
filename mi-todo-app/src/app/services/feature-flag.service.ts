import { Injectable, signal } from '@angular/core';
import { RemoteConfig, fetchAndActivate, getValue } from '@angular/fire/remote-config';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {

  readonly flags = signal<Record<string, boolean>>({
    enableDarkMode: false,
    enableTaskDescription: false,
    enableStatistics: false,
  });

  constructor(private remoteConfig: RemoteConfig) {}

  async loadFlags() {
    try {
      
      // Default values for the feature flags

      this.remoteConfig.defaultConfig = {
        enableDarkMode: false,
        enableTaskDescription: false,
        enableStatistics: false,
      };

      this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000;

      await fetchAndActivate(this.remoteConfig);

      this.flags.set({
        enableDarkMode: getValue(this.remoteConfig, 'enableDarkMode').asBoolean(),
        enableTaskDescription: getValue(this.remoteConfig, 'enableTaskDescription').asBoolean(),
        enableStatistics: getValue(this.remoteConfig, 'enableStatistics').asBoolean(),
      });
    } catch (err) {
      console.error('Error cargando feature flags', err);
    }
  }

  isEnabled(flag: string): boolean {
    return !!this.flags()[flag];
  }
}