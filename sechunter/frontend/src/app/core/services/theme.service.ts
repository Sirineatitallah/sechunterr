import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private darkThemeClass = 'dark-theme';
  private themeSubject = new BehaviorSubject<string>('light');
  theme$ = this.themeSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  private initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'dark' : 'light');

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.setTheme(e.matches ? 'dark' : 'light');
    });
  }

  setTheme(theme: string) {
    if (theme === 'dark') {
      this.renderer.addClass(document.body, this.darkThemeClass);
    } else {
      this.renderer.removeClass(document.body, this.darkThemeClass);
    }
    this.themeSubject.next(theme);
  }

  toggleTheme() {
    const currentTheme = this.themeSubject.getValue();
    this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }
}
