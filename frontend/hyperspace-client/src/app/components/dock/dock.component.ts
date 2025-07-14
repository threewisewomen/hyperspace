import { Component, ElementRef, HostListener, inject, Input, NgZone, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';

// --- Define the data structure for a Dock Item ---
export interface DockItem {
  id: string; // A unique ID for tracking
  icon: string; // The name of the Material Icon (e.g., 'home', 'upload_file')
  label: string;
  route: string; // The Angular route to navigate to
}

@Component({
  selector: 'app-dock',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './dock.component.html',
  styleUrls: ['./dock.component.scss'],
  animations: [
    trigger('labelAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(10px) scale(0.9)',
        visibility: 'hidden'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0) scale(1)',
        visibility: 'visible'
      })),
      transition('hidden <=> visible', [
        animate('0.2s cubic-bezier(0.25, 0.8, 0.25, 1)')
      ])
    ])
  ]
})
export class DockComponent {
  // --- @Input() properties to make the component configurable ---
  @Input() items: DockItem[] = [];
  @Input() magnification: number = 80; // Max size of the magnified icon
  @Input() baseItemSize: number = 50; // Normal size of the icon
  @Input() distance: number = 120; // The "magnetic field" distance of the mouse

  // A reference to all the dock item divs in the template
  @ViewChildren('dockItem') private itemElements!: QueryList<ElementRef<HTMLAnchorElement>>;

  private ngZone = inject(NgZone);
  private mouseX: number = -Infinity;
  hoveredItemIndex: number | null = null; // To track which label to show

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.pageX;
    // We run the animation logic outside of Angular's zone for performance
    this.ngZone.runOutsideAngular(() => {
      window.requestAnimationFrame(() => this.updateItemScales());
    });
  }

  // --- This handles the case where the user's mouse leaves the entire browser window ---
  @HostListener('document:mouseleave')
  onDocumentMouseLeave() {
    this.mouseX = -Infinity;
    this.ngZone.runOutsideAngular(() => {
      window.requestAnimationFrame(() => this.updateItemScales());
    });
  }

  private updateItemScales(): void {
    if (!this.itemElements) return;

    this.itemElements.forEach((el) => {
      const rect = el.nativeElement.getBoundingClientRect();
      // Use getBoundingClientRect for accuracy as it accounts for scroll position
      const itemCenterX = rect.left + rect.width / 2;

      const distanceToMouse = Math.abs(this.mouseX - itemCenterX);

      // Calculate a scale factor between 0 (far away) and 1 (directly under mouse)
      // Use Math.min to cap the distance, creating a defined "magnetic field".
      const scaleFactor = Math.max(0, 1 - distanceToMouse / this.distance);
      // Apply an easing function to make the transition smoother.
      const smoothedScaleFactor = this.easeOutQuint(scaleFactor);

      const targetSize = this.baseItemSize + (this.magnification - this.baseItemSize) * smoothedScaleFactor;

      // Apply the size directly to the element's style for max performance
      el.nativeElement.style.width = `${targetSize}px`;
      el.nativeElement.style.height = `${targetSize}px`;
    });
  }

  // Quintic easing function provides a more pronounced and satisfying curve
  private easeOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 5);
  }

  // Methods to handle which label should be shown
  onItemHover(index: number) {
    this.hoveredItemIndex = index;
  }

  onItemLeave() {
    this.hoveredItemIndex = null;
  }
}