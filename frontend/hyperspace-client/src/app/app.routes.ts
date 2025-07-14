import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { VisualizerComponent } from './pages/visualizer/visualizer.component';

export const routes: Routes = [
  // When the user visits the root URL, show the HomeComponent
  { path: '', component: HomeComponent },

  // When the user visits /visualizer, show the VisualizerComponent
  { path: 'visualizer', component: VisualizerComponent },

  // A redirect rule to handle any other URL, sending them to the home page
  { path: '**', redirectTo: '', pathMatch: 'full' }
];