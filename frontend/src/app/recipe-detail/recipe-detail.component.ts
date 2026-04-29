import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {

  recipe: any;
  isEditing = false;
  removeImage = false;
  removePdf = false;
  selectedIngredients: any[] = [];
  suggestions: any[] = [];
  ingredientSearch = '';
  recipeCategories = [
    { value: 'SALAD', label: 'Salad' },
    { value: 'SOUP', label: 'Soup' },
    { value: 'APPETIZER', label: 'Appetizer' },
    { value: 'MAIN', label: 'Main Course' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'DRINK', label: 'Drink' },
    { value: 'OTHER', label: 'Other' }
  ];
  private searchSubject = new Subject<string>();

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);

    this.recipeService.getRecipe(id).subscribe(recipe => {
      this.recipe = recipe;
      this.removeImage = false;
      this.removePdf = false;
      this.setupSelectedIngredients();
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.recipeService.searchItems(query))
    ).subscribe({
      next: data => this.suggestions = data,
      error: err => console.error('Search failed:', err)
    });
  }

  private setupSelectedIngredients() {
    this.selectedIngredients = [];
    if (!this.recipe?.recipe_ingredients) {
      return;
    }
    this.selectedIngredients = this.recipe.recipe_ingredients.map((ri: any) => ({
      ingredient: ri.ingredient,
      name: ri.ingredient_name,
      quantity: ri.quantity,
      unit: ri.unit || ri.ingredient_unit || '',
      allowed_units: ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'pinch', 'slice']
    }));
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

  getPdfUrl(pdfPath: string): string {
    if (!pdfPath) {
      return '';
    }
    if (pdfPath.startsWith('http://') || pdfPath.startsWith('https://')) {
      return pdfPath;
    }
    if (pdfPath.startsWith('/')) {
      return pdfPath;
    }
    return `http://127.0.0.1:8000/${pdfPath}`;
  }

  private getDefaultImage(category: string): string {
    const defaults: Record<string, string> = {
      SALAD: '/images/salad-svgrepo-com.svg',
      SOUP: '/images/soup-svgrepo-com.svg',
      APPETIZER: '/images/starter-svgrepo-com.svg',
      MAIN: '/images/bibimbub-cooking-food-svgrepo-com.svg',
      DESSERT: '/images/dessert-food-and-restaurant-svgrepo-com.svg',
      DRINK: '/images/drink-soft-drink-svgrepo-com.svg',
      OTHER: '/images/oden-svgrepo-com.svg'
    };
    return defaults[category] || defaults['OTHER'];
  }

  getCategoryLabel(value: string): string {
    const found = this.recipeCategories.find(cat => cat.value === value);
    return found ? found.label : value || 'Other';
  }

  onSearchInput() {
    if (!this.ingredientSearch.trim()) {
      this.suggestions = [];
      return;
    }
    this.searchSubject.next(this.ingredientSearch);
  }

  selectIngredient(item: any) {
    const already = this.selectedIngredients.find(i => i.ingredient === item.id);
    if (!already) {
      const allowedUnits = item.allowed_units && item.allowed_units.length > 0 ? item.allowed_units : ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'pinch', 'slice'];
      this.selectedIngredients.push({
        ingredient: item.id,
        name: item.name,
        quantity: '',
        unit: allowedUnits[0],
        allowed_units: allowedUnits
      });
    }
    this.ingredientSearch = '';
    this.suggestions = [];
  }

  removeIngredient(id: number) {
    this.selectedIngredients = this.selectedIngredients.filter(i => i.ingredient !== id);
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.recipe[field] = file;
      if (field === 'image') {
        this.removeImage = false;
      }
      if (field === 'pdf_file') {
        this.removePdf = false;
      }
    }
  }

  clearImage() {
    this.recipe.image = null;
    this.removeImage = true;
  }

  clearPdf() {
    this.recipe.pdf_file = null;
    this.removePdf = true;
  }

  editRecipe() {
    this.isEditing = true;
  }

  saveRecipe() {
    if (!this.recipe.title?.trim()) {
      alert('Title is required');
      return;
    }

    if (!this.selectedIngredients.length) {
      alert('At least one ingredient is required');
      return;
    }

    for (const ing of this.selectedIngredients) {
      if (!ing.quantity || !ing.unit) {
        alert('All ingredients must have quantity and unit');
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', this.recipe.title || '');
    formData.append('description', this.recipe.description || '');
    formData.append('category', this.recipe.category || 'OTHER');
    formData.append('servings', String(this.recipe.servings || 1));
    formData.append('instructions', this.recipe.instructions || '');

    if (this.recipe.image instanceof File) {
      formData.append('image', this.recipe.image);
    } else if (this.removeImage) {
      formData.append('image', '');
    }

    if (this.recipe.pdf_file instanceof File) {
      formData.append('pdf_file', this.recipe.pdf_file);
    } else if (this.removePdf) {
      formData.append('pdf_file', '');
    }

    const ingredientPayload = this.selectedIngredients.map((ing: any) => ({
      ingredient: ing.ingredient,
      quantity: ing.quantity,
      unit: ing.unit
    }));
    formData.append('ingredients_data', JSON.stringify(ingredientPayload));

    this.recipeService.updateRecipe(this.recipe.id, formData).subscribe(() => {
      this.isEditing = false;
      this.recipeService.getRecipe(this.recipe.id).subscribe(recipe => {
        this.recipe = recipe;
        this.setupSelectedIngredients();
      });
    }, err => {
      console.error('Update failed:', err);
      alert('Failed to save recipe. Check console for details.');
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.ngOnInit();
  }

  deleteRecipe() {
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.recipeService.deleteRecipe(this.recipe.id).subscribe(() => {
        this.router.navigate(['/']);
      }, err => {
        console.error('Delete failed:', err);
        alert('Could not delete recipe.');
      });
    }
  }
}