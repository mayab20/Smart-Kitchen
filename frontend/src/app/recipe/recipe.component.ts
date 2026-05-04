import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.scss',
})
export class RecipesComponent implements OnInit {
  recipes: any[] = [];
  isLoading = true;
  selectedCategory = 'ALL';
  searchTitle = '';

  recipeCategories = [
    { value: 'ALL', label: 'All' },
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'LUNCH', label: 'Lunch' },
    { value: 'DINNER', label: 'Dinner' },
    { value: 'SNACK', label: 'Snack' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'APPETIZER', label: 'Appetizer' },
    { value: 'SIDE_DISH', label: 'Side Dish' },
    { value: 'SOUP', label: 'Soup' },
    { value: 'SALAD', label: 'Salad' },
    { value: 'BEVERAGE', label: 'Beverage' },
  ];

  constructor(private recipeService: RecipeService) {}

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.isLoading = true;
    this.recipeService.getRecipes().subscribe({
      next: (data: any[]) => {
        this.recipes = data;
        this.isLoading = false;
      },
      error: () => {
        this.recipes = [];
        this.isLoading = false;
      },
    });
  }

  get filteredRecipes() {
    return this.recipes.filter((recipe) => {
      const matchesCategory =
        this.selectedCategory === 'ALL' ||
        recipe.category === this.selectedCategory;

      const matchesTitle =
        !this.searchTitle.trim() ||
        recipe.title
          ?.toLowerCase()
          .includes(this.searchTitle.toLowerCase().trim());

      return matchesCategory && matchesTitle;
    });
  }

  getImageUrl(imagePath: string | null, category: string): string {
    if (imagePath) {
      if (imagePath.startsWith('data:')) {
        return imagePath;
      }

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

  private getDefaultImage(category: string): string {
    const defaults: Record<string, string> = {
      BREAKFAST: '/images/breakfast-svgrepo-com.svg',
      LUNCH: '/images/lunch-svgrepo-com.svg',
      DINNER: '/images/dinner-svgrepo-com.svg',
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
}
