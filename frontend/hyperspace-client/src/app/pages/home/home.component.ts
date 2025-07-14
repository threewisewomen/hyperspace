import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Import RouterLink
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule
import { BackgroundCanvasComponent } from '../../components/background-canvas/background-canvas.component';
import { TextTrailComponent } from '../../components/text-trail/text-trail.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BackgroundCanvasComponent, RouterLink, MatButtonModule,TextTrailComponent ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {}