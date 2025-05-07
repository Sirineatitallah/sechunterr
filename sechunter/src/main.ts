import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import Chart.js and register required components
import {
  Chart,
  registerables,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  PolarAreaController,
  RadialLinearScale,
  ArcElement,
  RadarController,
  Tooltip,
  Legend
} from 'chart.js';

// Register all components
Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  PolarAreaController,
  RadialLinearScale,
  ArcElement,
  RadarController,
  Tooltip,
  Legend,
  ...registerables
);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
