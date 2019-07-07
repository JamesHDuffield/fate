import { Injectable } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt();
  userChoice: Promise<{}>;
}
@Injectable()
export class PwaInstaller {

  private capturedEvent: BeforeInstallPromptEvent = null;

  startCapturingEvent() {
    //i know window should be reffed in, but I can envision no scenario where this will break. Except testing (and i can mock window here then).
    console.log('[PWA] Starting to capture possible install prompt');
    if (window) {
      window.addEventListener('beforeinstallprompt', (event: BeforeInstallPromptEvent) => {
        console.log('[PWA] Received the prompt event', event);
        if (event) {
          event.preventDefault();
          this.capturedEvent = event;
        }
      });
    }
  }

  async installApp() {
    if (this.capturedEvent != null) {
      this.capturedEvent.prompt();
      await this.capturedEvent.userChoice;
      this.capturedEvent = null;
    }
  }

  get isPromptable() {
    return this.capturedEvent != null;
  }

}
