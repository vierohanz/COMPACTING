import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  computed,
  inject,
  signal
} from '@angular/core';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  badge?: string;
  description?: string;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full select-none text-left" #dropdownContainer>
      <label *ngIf="label" class="text-xs font-semibold text-slate-200 block mb-1.5">
        {{ label }}
      </label>

      <!-- Trigger Button -->
      <button
        type="button"
        (click)="toggle()"
        [disabled]="disabled"
        class="flex h-10 w-full items-center justify-between rounded-xl border bg-[#0c1e38] px-3.5 py-2 text-xs font-bold shadow-md transition-all cursor-pointer focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        [ngClass]="[
          isOpen()
            ? 'border-[#e21b24] ring-2 ring-[#e21b24]/30 shadow-lg shadow-[#e21b24]/20 text-white'
            : 'border-[#132d52] hover:border-[#e21b24]/60 text-slate-100 hover:bg-[#132d52]/50'
        ]"
      >
        <div class="flex items-center gap-2 truncate">
          <span class="truncate font-bold text-white">
            {{ selectedOption()?.label || placeholder }}
          </span>
          <span
            *ngIf="selectedOption()?.badge"
            class="rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#e21b24]/20 text-[#ffcc00] border border-[#e21b24]/40"
          >
            {{ selectedOption()?.badge }}
          </span>
        </div>

        <svg
          class="h-4 w-4 text-slate-400 transition-transform duration-200"
          [ngClass]="{ 'rotate-180 text-[#e21b24]': isOpen() }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <!-- Dropdown Menu (Solid Navy Spider Theme, NO GLASS) -->
      <div
        *ngIf="isOpen()"
        class="absolute left-0 right-0 z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-[#132d52] bg-[#071324] p-1.5 shadow-2xl transition-all animate-in fade-in zoom-in-95"
      >
        <div class="space-y-1">
          <button
            type="button"
            *ngFor="let opt of parsedOptions()"
            (click)="selectOption(opt)"
            class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-bold transition-all cursor-pointer text-left"
            [ngClass]="
              opt.value === selectedValue()
                ? 'bg-[#e21b24] text-white shadow-md shadow-[#e21b24]/30'
                : 'text-slate-200 hover:bg-[#132d52] hover:text-white'
            "
          >
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="font-bold">
                  {{ opt.label }}
                </span>
                <span
                  *ngIf="opt.badge"
                  class="rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  [ngClass]="
                    opt.value === selectedValue()
                      ? 'bg-white/20 text-white'
                      : 'bg-[#e21b24]/20 text-[#ffcc00] border border-[#e21b24]/40'
                  "
                >
                  {{ opt.badge }}
                </span>
              </div>
              <span
                *ngIf="opt.description"
                class="text-[10px] mt-0.5 font-medium"
                [ngClass]="opt.value === selectedValue() ? 'text-white/80' : 'text-slate-400'"
              >
                {{ opt.description }}
              </span>
            </div>

            <svg
              *ngIf="opt.value === selectedValue()"
              class="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class CustomSelectComponent<T = string> {
  private elRef = inject(ElementRef);

  @Input() label?: string;
  @Input() placeholder: string = 'Select option';
  @Input() disabled: boolean = false;

  @Input() set options(val: (SelectOption<T> | string)[]) {
    this._options.set(val || []);
  }

  @Input() set value(val: T | undefined) {
    this.selectedValue.set(val);
  }

  @Output() valueChange = new EventEmitter<T>();

  private _options = signal<(SelectOption<T> | string)[]>([]);
  readonly selectedValue = signal<T | undefined>(undefined);
  readonly isOpen = signal<boolean>(false);

  readonly parsedOptions = computed<SelectOption<T>[]>(() => {
    return this._options().map(opt => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt as unknown as T };
      }
      return opt;
    });
  });

  readonly selectedOption = computed<SelectOption<T> | undefined>(() => {
    return this.parsedOptions().find(o => o.value === this.selectedValue());
  });

  toggle() {
    if (!this.disabled) {
      this.isOpen.set(!this.isOpen());
    }
  }

  selectOption(option: SelectOption<T>) {
    this.selectedValue.set(option.value);
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
