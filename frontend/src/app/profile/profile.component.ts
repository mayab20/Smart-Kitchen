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
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  myRecipes: any[] = [];

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.recipeService.getMyRecipes().subscribe({
      next: (data) => (this.myRecipes = data),
      error: (err) => {
        console.error('Failed to load recipes:', err);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  deleteRecipe(id: number) {
    this.recipeService.deleteRecipe(id).subscribe(() => {
      this.myRecipes = this.myRecipes.filter((r) => r.id !== id);
    });
  }

  getImageUrl(imagePath: string | null, category: string): string {
    if (imagePath) {
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      if (imagePath.startsWith('/media/')) {
        return `http://127.0.0.1:8000${imagePath}`;
      }
      if (imagePath.startsWith('/')) {
        return imagePath;
      }
      if (imagePath.startsWith('media/')) {
        return `http://127.0.0.1:8000/${imagePath}`;
      }
      return `http://127.0.0.1:8000/media/${imagePath}`;
    }
    return this.getDefaultImage(category);
  }

  onImageError(event: Event, category: string) {
    const image = event.target as HTMLImageElement;
    image.src = this.getDefaultImage(category);
  }

  private getDefaultImage(category: string): string {
    const defaults: Record<string, string> = {
      BREAKFAST: '/images/breakfast-svgrepo-com.svg',
      LUNCH: '/images/bibimbub-cooking-food-svgrepo-com.svg',
      DINNER: '/images/bibimbub-cooking-food-svgrepo-com.svg',
      SNACK: '/images/snack-svgrepo-com.svg',
      DESSERT: '/images/dessert-food-and-restaurant-svgrepo-com.svg',
      APPETIZER: '/images/starter-svgrepo-com.svg',
      SIDE_DISH: '/images/side-dish-svgrepo-com.svg',
      SOUP: '/images/soup-svgrepo-com.svg',
      SALAD: '/images/salad-svgrepo-com.svg',
      BEVERAGE: '/images/drink-soft-drink-svgrepo-com.svg',
    };
    return defaults[category] || '/images/oden-svgrepo-com.svg';
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
