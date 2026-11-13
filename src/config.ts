export interface AppConfig {
  appName: string;
  appVersion: string;
  author: string;
}

export const config: AppConfig = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Daftar Tugas Kuliah',
  appVersion: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
  author: import.meta.env.VITE_APP_AUTHOR ?? 'Tsulsi Khoirunisa',
};

export function showAppInfo(): void {
  const target = document.querySelector<HTMLElement>('#app-info');
  if (target) {
    target.textContent = `${config.appName} v${config.appVersion} • ${config.author}`;
  }
  document.title = `${config.appName} | ${config.author}`;
}