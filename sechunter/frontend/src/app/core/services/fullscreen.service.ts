import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Add TypeScript interface for browser-specific fullscreen properties
interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class FullscreenService {
  private isFullscreenSubject = new BehaviorSubject<boolean>(false);
  public isFullscreen$ = this.isFullscreenSubject.asObservable();
  private doc: FullscreenDocument = document as FullscreenDocument;

  constructor() {
    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreenSubject.next(!!document.fullscreenElement);
    });

    document.addEventListener('webkitfullscreenchange', () => {
      this.isFullscreenSubject.next(!!(this.doc.webkitFullscreenElement));
    });

    document.addEventListener('mozfullscreenchange', () => {
      this.isFullscreenSubject.next(!!(this.doc.mozFullScreenElement));
    });

    document.addEventListener('MSFullscreenChange', () => {
      this.isFullscreenSubject.next(!!(this.doc.msFullscreenElement));
    });
  }

  /**
   * Toggle fullscreen mode
   * @returns Promise that resolves when the operation is complete
   */
  public toggleFullscreen(): Promise<void> {
    if (this.isFullscreenActive()) {
      return this.exitFullscreen();
    } else {
      return this.enterFullscreen();
    }
  }

  /**
   * Enter fullscreen mode
   * @returns Promise that resolves when the operation is complete
   */
  public enterFullscreen(): Promise<void> {
    const docEl = document.documentElement as FullscreenElement;

    if (docEl.requestFullscreen) {
      return docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      return docEl.webkitRequestFullscreen();
    } else if (docEl.mozRequestFullScreen) {
      return docEl.mozRequestFullScreen();
    } else if (docEl.msRequestFullscreen) {
      return docEl.msRequestFullscreen();
    }

    return Promise.resolve();
  }

  /**
   * Exit fullscreen mode
   * @returns Promise that resolves when the operation is complete
   */
  public exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if (this.doc.webkitExitFullscreen) {
      return this.doc.webkitExitFullscreen();
    } else if (this.doc.mozCancelFullScreen) {
      return this.doc.mozCancelFullScreen();
    } else if (this.doc.msExitFullscreen) {
      return this.doc.msExitFullscreen();
    }

    return Promise.resolve();
  }

  /**
   * Check if fullscreen mode is currently active
   * @returns boolean indicating if fullscreen is active
   */
  public isFullscreenActive(): boolean {
    return !!(
      document.fullscreenElement ||
      this.doc.webkitFullscreenElement ||
      this.doc.mozFullScreenElement ||
      this.doc.msFullscreenElement
    );
  }

  /**
   * Get an observable that emits the current fullscreen state
   * @returns Observable<boolean> that emits true when in fullscreen mode
   */
  public getFullscreenState(): Observable<boolean> {
    return this.isFullscreen$;
  }
}
