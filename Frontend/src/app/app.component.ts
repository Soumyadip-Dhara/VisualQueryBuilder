import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QueryBuilderComponent } from './components/query-builder/query-builder.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, QueryBuilderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Visual Query Builder';
}
