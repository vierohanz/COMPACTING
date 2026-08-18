import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spider-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative flex items-center justify-center select-none transition-transform duration-300 hover:scale-105"
      [style.width.px]="size"
      [style.height.px]="size"
    >
      <svg
        [attr.width]="size"
        [attr.height]="size"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-full h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
      >
        <!-- Outer Black Border & Red Base -->
        <circle cx="100" cy="100" r="95" fill="#E21B24" stroke="#000000" stroke-width="9" />

        <!-- Radial Web Strands from Nose Bridge Center (100, 95) -->
        <g stroke="#000000" stroke-width="2.8" stroke-linecap="round">
          <!-- Top vertical -->
          <line x1="100" y1="8" x2="100" y2="82" />
          <!-- Bottom vertical -->
          <line x1="100" y1="110" x2="100" y2="192" />
          
          <!-- Diagonal rays -->
          <line x1="100" y1="95" x2="167" y2="33" />
          <line x1="100" y1="95" x2="190" y2="67" />
          <line x1="100" y1="95" x2="195" y2="100" />
          <line x1="100" y1="95" x2="190" y2="135" />
          <line x1="100" y1="95" x2="167" y2="167" />
          <line x1="100" y1="95" x2="133" y2="190" />

          <line x1="100" y1="95" x2="33" y2="33" />
          <line x1="100" y1="95" x2="10" y2="67" />
          <line x1="100" y1="95" x2="5" y2="100" />
          <line x1="100" y1="95" x2="10" y2="135" />
          <line x1="100" y1="95" x2="33" y2="167" />
          <line x1="100" y1="95" x2="67" y2="190" />

          <line x1="100" y1="95" x2="67" y2="12" />
          <line x1="100" y1="95" x2="133" y2="12" />
        </g>

        <!-- Concentric Web Arcs -->
        <!-- Ring 1 (Small) -->
        <path
          d="M 80,82 Q 100,75 120,82 Q 125,98 120,114 Q 100,120 80,114 Q 75,98 80,82 Z"
          fill="none"
          stroke="#000000"
          stroke-width="2.6"
        />

        <!-- Ring 2 (Medium) -->
        <path
          d="M 60,65 Q 100,52 140,65 Q 152,98 140,132 Q 100,144 60,132 Q 48,98 60,65 Z"
          fill="none"
          stroke="#000000"
          stroke-width="3"
        />

        <!-- Ring 3 (Large) -->
        <path
          d="M 40,48 Q 100,30 160,48 Q 175,98 160,150 Q 100,168 40,150 Q 25,98 40,48 Z"
          fill="none"
          stroke="#000000"
          stroke-width="3.5"
        />

        <!-- Ring 4 (Outer) -->
        <path
          d="M 22,32 Q 100,12 178,32 Q 192,98 178,168 Q 100,188 22,168 Q 8,98 22,32 Z"
          fill="none"
          stroke="#000000"
          stroke-width="4"
        />

        <!-- Spider-Man Eyes (Left Eye) -->
        <path
          d="M 42,118 C 38,72 65,50 88,65 C 90,88 80,130 42,118 Z"
          fill="#FFFFFF"
          stroke="#000000"
          stroke-width="8.5"
          stroke-linejoin="round"
        />

        <!-- Spider-Man Eyes (Right Eye) -->
        <path
          d="M 158,118 C 162,72 135,50 112,65 C 110,88 120,130 158,118 Z"
          fill="#FFFFFF"
          stroke="#000000"
          stroke-width="8.5"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  `
})
export class SpiderBadgeComponent {
  @Input() size = 120;
}
