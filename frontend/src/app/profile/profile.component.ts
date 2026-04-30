import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../services/recipe.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  myRecipes: any[] = [];

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.recipeService.getMyRecipes().subscribe({
      next: data => this.myRecipes = data,
      error: err => {
        console.error('Failed to load recipes:', err);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  deleteRecipe(id: number) {
    this.recipeService.deleteRecipe(id).subscribe(() => {
      this.myRecipes = this.myRecipes.filter(r => r.id !== id);
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

}
