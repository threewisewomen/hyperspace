import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Import our new DockComponent and its data interface
import { DockComponent, DockItem } from './components/dock/dock.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DockComponent // Add DockComponent to the imports
  ],
  // Use templateUrl to point to the external HTML file
  templateUrl: './app.component.html',
  // Use styleUrls to point to the external SCSS file
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Define the data for our dock items here
  dockItems: DockItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home', // Material Icon name for 'home'
      route: '/' // Route to the landing page
    },
    {
      id: 'visualizer',
      label: 'Visualizer',
      icon: 'bubble_chart', // Material Icon name for a 'visualization' concept
      route: '/visualizer' // Route to the main tool
    }
  ];
}