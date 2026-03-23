import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../core/i18n.service';

@Pipe({
  name: 'tr',
  standalone: true,
  pure: false,
})
export class TrPipe implements PipeTransform {
  private readonly sub: Subscription;

  constructor(
    private readonly i18n: I18nService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.sub = this.i18n.lang$.subscribe(() => this.cdr.markForCheck());
  }

  transform(key: string): string {
    return this.i18n.t(key);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
