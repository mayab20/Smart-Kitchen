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

  recipeCategories = [
    { value: 'ALL', label: 'All' },
    { value: 'SALAD', label: 'Salad' },
    { value: 'SOUP', label: 'Soup' },
    { value: 'APPETIZER', label: 'Appetizer' },
    { value: 'MAIN', label: 'Main Course' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'DRINK', label: 'Drink' },
    { value: 'OTHER', label: 'Other' },
  ];

  newRecipe: any = {
    title: '',
    description: '',
    instructions: '',
  };

  constructor(private recipeService: RecipeService) {}

  ngOnInit() {
    this.loadRecipes();
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    this.newRecipe[field] = file;
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
    if (this.selectedCategory === 'ALL') {
      return this.recipes;
    }
    return this.recipes.filter(
      (recipe) => recipe.category === this.selectedCategory,
    );
  }

  addRecipe() {
    const formData = new FormData();

    for (let key in this.newRecipe) {
      formData.append(key, this.newRecipe[key]);
    }

    this.recipeService.addRecipe(formData).subscribe(() => {
      this.loadRecipes();
    });
  }

  deleteRecipe(id: number) {
    this.recipeService.deleteRecipe(id).subscribe(() => {
      this.loadRecipes();
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

  private getDefaultImage(category: string): string {
    const defaults: Record<string, string> = {
      SALAD: '/images/salad-svgrepo-com.svg',
      SOUP: '/images/soup-svgrepo-com.svg',
      APPETIZER: '/images/starter-svgrepo-com.svg',
      MAIN: '/images/bibimbub-cooking-food-svgrepo-com.svg',
      DESSERT: '/images/dessert-food-and-restaurant-svgrepo-com.svg',
      DRINK: '/images/drink-soft-drink-svgrepo-com.svg',
      OTHER: '/images/oden-svgrepo-com.svg',
    };
    return defaults[category] || defaults['OTHER'];
  }
}
