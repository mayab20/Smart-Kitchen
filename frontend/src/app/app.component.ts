import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecipesComponent } from './recipe/recipe.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RecipesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
