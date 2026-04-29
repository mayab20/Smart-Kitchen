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
  styleUrl: './recipe.component.scss'
})
export class RecipesComponent implements OnInit {

  recipes: any[] = [];
  selectedCategory = 'ALL';

  recipeCategories = [
    { value: 'ALL', label: 'All' },
    { value: 'SALAD', label: 'Salad' },
    { value: 'SOUP', label: 'Soup' },
    { value: 'APPETIZER', label: 'Appetizer' },
    { value: 'MAIN', label: 'Main Course' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'DRINK', label: 'Drink' },
    { value: 'OTHER', label: 'Other' }
  ];

  newRecipe: any = {
    title: '',
    description: '',
    instructions: ''
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
    this.recipeService.getRecipes().subscribe((data: any[]) => {
      this.recipes = data;
    });
  }

  get filteredRecipes() {
    if (this.selectedCategory === 'ALL') {
      return this.recipes;
    }
    return this.recipes.filter(recipe => recipe.category === this.selectedCategory);
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
      if (imagePath.startsWith('/')) {
        return imagePath;
      }
      return `http://127.0.0.1:8000/${imagePath}`;
    }
    return this.getDefaultImage(category);
  }

  private getDefaultImage(category: string): string {
    const defaults: Record<string, string> = {
      SALAD: '/images/default-salad.svg',
      SOUP: '/images/default-soup.svg',
      APPETIZER: '/images/default-appetizer.svg',
      MAIN: '/images/default-main.svg',
      DESSERT: '/images/default-dessert.svg',
      DRINK: '/images/default-drink.svg',
      OTHER: '/images/default-other.svg'
    };
    return defaults[category] || defaults['OTHER'];
  }
}
