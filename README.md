# Accenture Frontend Test — To-Do App

A **multiplatform mobile application** for task management built with **Angular 20 + Ionic 7 + Cordova**, integrated with **Firebase Remote Config** for dynamic feature flags. Supports **web**, **Android**, and **iOS** from a single codebase.

---

## 📁 Project Structure

```
mi-todo-app/
├── package.json
├── angular.json
├── ionic.config.json
├── config.xml
├── README.md
├── DECISIONS.md
├── .gitignore
│
└── src/
    ├── main.ts
    ├── index.html
    ├── global.scss               ← Global styles, animations, alerts
    ├── theme/
    │   └── variables.scss        ← Accenture color palette
    ├── environments/
    │   ├── environment.ts        ← Dev (your Firebase config goes here)
    │   └── environment.prod.ts
    └── app/
        ├── app.component.ts
        ├── app.config.ts         ← Global providers
        ├── app.routes.ts         ← Lazy-loaded routes
        ├── models/
        │   └── task.model.ts
        ├── services/
        │   ├── task.service.ts
        │   ├── feature-flag.service.ts
        │   └── theme.service.ts
        ├── components/
        │   ├── task-item/
        │   ├── category-filter/
        │   └── theme-toggle/
        └── pages/
            ├── home/
            ├── categories/
            ├── category-form/
            └── task-form/
            
        
```

---

## ✅ Prerequisites

Before starting, make sure you have the following installed:

| # | Tool | Notes |
|---|------|-------|
| 1 | **Node.js v18+ and npm** | [nodejs.org](https://nodejs.org/) |
| 2 | **Ionic CLI** | `npm install -g @ionic/cli` |
| 3 | **Cordova CLI** | `npm install -g cordova` |
| 4 | **Android Studio + JDK 17** | Only for Android builds — [developer.android.com/studio](https://developer.android.com/studio) |
| 5 | **Xcode** | Only for iOS builds, requires macOS |
| 6 | **Git** *(optional)* | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <https://github.com/coltonsini/Accenture-frontendTest>
cd mi-todo-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

The app uses **Firebase Remote Config** to control feature flags dynamically.

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Register a **Web App** and copy the `firebaseConfig` object.
3. Activate **Remote Config** from the side menu and create these parameters:

| Parameter | Type | Default |
|-----------|------|---------|
| `enableDarkMode` | Boolean | `true` |
| `enableTaskDescription` | Boolean | `true` |
| `enableStatistics` | Boolean | `true` |

4. Click **"Publish changes"** (top right) — required for changes to take effect.

5. Open `src/environments/environment.ts` and paste your config:

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '...',
    appId: '...'
  }
};
```

> ⚠️ Do the same in `environment.prod.ts` for production builds.

---

## ▶️ Running the App

### Web (Browser)

```bash
ionic serve
```

The app opens at [http://localhost:8100](http://localhost:8100).

### Android Device

```bash
# Add the platform (only the first time)
npx cordova platform add android@13.0.0

# Build and run on connected device
npx cordova run android --device
```

> Make sure **USB debugging** is enabled on your phone and `adb devices` shows it as connected.

### iOS Device *(macOS only)*

```bash
ionic cordova platform add ios
ionic cordova build ios
open platforms/ios/MyApp.xcworkspace
```

Then run from Xcode using the **▶** button.

---

## 🚩 Feature Flags Reference

Feature flags are loaded from Firebase at app startup and control parts of the UI dynamically.

| Flag | Type | Controls |
|------|------|----------|
| `enableDarkMode` | Boolean | Shows/hides the dark mode toggle in the header |
| `enableTaskDescription` | Boolean | Shows/hides the description field in form and cards |
| `enableStatistics` | Boolean | Shows/hides the Total/Completed stats panel |

**To update a flag in production:**
1. Edit the value in Firebase Console.
2. Click **Publish changes**.
3. The app will pick up the new value on next launch *(or after 1h cache in production)*.

---

## 📦 Build for Production

### Web

```bash
ionic build --prod
```

Output goes to `www/`.

### Android (APK)

```bash
npx cordova build android --prod --release
```

Output: `platforms/android/app/build/outputs/apk/release/app-release.apk`

### iOS

```bash
npx cordova build ios --prod --release
```

Then archive and distribute via **Xcode → Organizer**.

---

## 🏗️ Architecture Overview

| Layer | Technology |
|-------|------------|
| UI | Ionic 7 standalone components |
| Framework | Angular 20 (Signals + Standalone) |
| State | Service + Signals pattern (no NgRx) |
| Persistence | Ionic Storage (IndexedDB on web, SQLite on native) |
| Feature Flags | Firebase Remote Config |
| Mobile packaging | Apache Cordova |
| Theming | CSS Variables (Accenture palette) |

---

## Category Management

Categories are fully customizable:

- **Default categories** (Work, Personal, Study, Other) ship with the app
- **Create** new categories with custom name, emoji, and color
- **Edit** any category — including defaults
- **Delete** with smart task handling:
  - If category has no tasks → simple confirmation
  - If category has tasks → choose to reassign or delete them
- The last remaining category cannot be deleted (always at least one)
- Categories persist locally with Ionic Storage

---

## ⚙️ Environment Variables Reference

| Variable | File | Description | Required |
|----------|------|-------------|----------|
| `firebaseConfig.apiKey` | `environment.ts` | Firebase Web API key | ✅ Yes |
| `firebaseConfig.projectId` | `environment.ts` | Firebase project ID | ✅ Yes |
| `firebaseConfig.appId` | `environment.ts` | Firebase app ID | ✅ Yes |
| `production` | `environment.prod.ts` | Toggles cache strategy and logging | ❌ Optional |

> All Firebase keys belong to client-side config — they are safe to commit when proper **Firebase Security Rules** are in place. For an extra layer of protection, use **Firebase App Check**.

---

## ⚡ Performance Optimizations

| Technique | Where Applied |
|-----------|---------------|
| Standalone Components | All components and pages |
| Angular Signals | `TaskService`, `ThemeService`, `FeatureFlagService` |
| `ChangeDetection.OnPush` | `HomePage`, `TaskItemComponent`, `CategoryFilterComponent` |
| Lazy loading routes | All pages via `loadComponent` |
| Tree-shaken icons | `addIcons({ add })` instead of full Ionicons import |
| Dynamic Firebase import | `await import('firebase/...')` reduces initial bundle ~400 KB |
| `@for track` | Reuses DOM nodes when list updates |
| CSS animations only | No animation libraries → 0 KB extra |
| `prefers-reduced-motion` | Respects user accessibility preference |

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `ENOENT: no such file ... android/package.json` | Delete `android/`, `platforms/`, `plugins/` and run `ionic cordova platform add android` again. |
| `Schema validation failed: must NOT have additional properties (buildOptimizer)` | Remove `"buildOptimizer": true` from `angular.json`. It's auto-applied in modern Angular. |
| `bundle initial exceeded maximum budget` | Increase budgets in `angular.json` or apply dynamic Firebase import. See `docs/PERFORMANCE.md`. |
| Feature flags don't update in real time | Click **Publish changes** in Firebase Console. In production, cache lasts 1 hour by design. |
| FAB hidden behind Android navigation bar | Ensure `<meta name="viewport" content="viewport-fit=cover, ...">` in `index.html`. |
| `Could not read package.json` (Cordova) | Use `ionic cordova platform add` instead of `npx cordova platform add`. |
| Dark mode toggle not visible | Check that `enableDarkMode = true` in Firebase and that changes were published. |
| Gradle error on Android build | Use JDK 17, not 11 or 21. Verify with `java --version`. |
| `Module has no exported member 'XComponent'` | Ensure the class is declared with `export class XComponent`. |

---

## 🧰 Tech Stack Summary

| Category | Technology |
|----------|------------|
| Framework | Angular 20 |
| UI | Ionic 7 |
| Language | TypeScript 5 |
| State | Angular Signals |
| Storage | Ionic Storage (IndexedDB / SQLite) |
| Feature Flags | Firebase Remote Config |
| Mobile | Apache Cordova 13 |
| Styles | SCSS + CSS Variables |
| Fonts | Inter (Google Fonts) |