import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

declare var webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root',
})
export class VoiceCommandService {
  private recognition: any;
  private isListening = false;
  public command$ = new Subject<string>();

  constructor(private ngZone: NgZone) {
    const SpeechRecognition = (window as any).SpeechRecognition || webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.lang = 'fr-FR';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        this.ngZone.run(() => {
          this.command$.next(transcript);
        });
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition.start();
        }
      };
    } else {
      console.warn('Web Speech API is not supported in this browser.');
    }
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }
}
