import { Injectable, afterNextRender, Injector, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export interface ToastOptions {
  life?: number; // milliseconds
  sticky?: boolean;
  key?: string; // PrimeNG toast key to target a specific toast component
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private defaultLife = 4000;
  private liveRegionEl: HTMLDivElement | null = null;

  private injector = inject(Injector);
  
  constructor(private messageService: MessageService) {
    afterNextRender(() => {
      this.ensureLiveRegion();
    }, { injector: this.injector });
  }

  private ensureLiveRegion() {
    if (this.liveRegionEl) return;
    const el = document.createElement('div');
    el.className = 'sr-only';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    // keep it visually hidden but available to screen readers
    document.body.appendChild(el);
    this.liveRegionEl = el;
  }

  private announceForA11y(message: string) {
    if (!this.liveRegionEl) this.ensureLiveRegion();
    if (!this.liveRegionEl) return;
    // Clear then set to trigger screen readers reliably
    this.liveRegionEl.textContent = '';
    // tiny timeout to ensure change is detected by AT
    setTimeout(() => (this.liveRegionEl!.textContent = message), 50);
  }

  private buildMessage(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail?: string, opts?: ToastOptions) {
    const msg: any = {
      severity,
      summary,
      detail,
      life: opts?.sticky ? undefined : opts?.life ?? this.defaultLife,
      sticky: !!opts?.sticky
    };
    if (opts?.key) msg.key = opts.key;
    return msg;
  }

  success(summary: string, detail?: string, opts?: ToastOptions) {
    const msg = this.buildMessage('success', summary, detail, opts);
    this.messageService.add(msg);
    this.announceForA11y(`${summary}${detail ? ' - ' + detail : ''}`);
  }

  info(summary: string, detail?: string, opts?: ToastOptions) {
    const msg = this.buildMessage('info', summary, detail, opts);
    this.messageService.add(msg);
    this.announceForA11y(`${summary}${detail ? ' - ' + detail : ''}`);
  }

  warn(summary: string, detail?: string, opts?: ToastOptions) {
    const msg = this.buildMessage('warn', summary, detail, opts);
    this.messageService.add(msg);
    this.announceForA11y(`${summary}${detail ? ' - ' + detail : ''}`);
  }

  error(summary: string, detail?: string, opts?: ToastOptions) {
    const msg = this.buildMessage('error', summary, detail, opts);
    this.messageService.add(msg);
    this.announceForA11y(`${summary}${detail ? ' - ' + detail : ''}`);
  }
}
