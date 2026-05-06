import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss'],
})
export class RecipeFormComponent implements OnDestroy, OnInit {
  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;

  recipe: any = {
    title: '',
    description: '',
    category: 'BREAKFAST',
    pdf_file: null,
  };
  selectedImageName = '';
  selectedImagePreview = '';

  recipeCategories = [
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

  selectedIngredients: any[] = [];
  suggestions: any[] = [];
  ingredientSearch = '';
  showSuggestions = false;
  private searchSubject = new Subject<string>();

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router,
  ) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.recipeService.searchItems(query)),
      )
      .subscribe({
        next: (data) => (this.suggestions = data),
        error: (err) => console.error('Search failed:', err),
      });
  }

  ngOnDestroy() {
    this.clearImagePreviewUrl();
  }

  onSearchInput() {
    if (!this.ingredientSearch.trim()) {
      this.suggestions = [];
      return;
    }
    this.searchSubject.next(this.ingredientSearch);
  }

  selectIngredient(item: any) {
    const already = this.selectedIngredients.find(
      (i) => i.ingredient === item.id,
    );
    if (!already) {
      const allowedUnits =
        item.allowed_units && item.allowed_units.length > 0
          ? item.allowed_units
          : [
              'g',
              'kg',
              'ml',
              'l',
              'cup',
              'tbsp',
              'tsp',
              'piece',
              'pinch',
              'slice',
            ];
      this.selectedIngredients.push({
        ingredient: item.id,
        name: item.name,
        quantity: '',
        unit: allowedUnits[0],
        allowed_units: allowedUnits,
      });
    }
    this.ingredientSearch = '';
    this.suggestions = [];
    this.showSuggestions = false;
  }

  removeIngredient(id: number) {
    this.selectedIngredients = this.selectedIngredients.filter(
      (i) => i.ingredient !== id,
    );
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    this.recipe[field] = file;

    if (field === 'image') {
      this.clearImagePreviewUrl();
      this.selectedImageName = file?.name || '';
      this.selectedImagePreview = file ? URL.createObjectURL(file) : '';
    }
  }

  removeImage() {
    this.recipe.image = null;
    this.selectedImageName = '';
    this.clearImagePreviewUrl();

    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
  }

  private clearImagePreviewUrl() {
    if (this.selectedImagePreview) {
      URL.revokeObjectURL(this.selectedImagePreview);
      this.selectedImagePreview = '';
    }
  }

  submit() {
    // Validation
    if (!this.recipe.title.trim()) {
      alert('Title is required');
      return;
    }

    if (this.selectedIngredients.length === 0) {
      alert('At least one ingredient is required');
      return;
    }

    for (let ing of this.selectedIngredients) {
      if (!ing.quantity || !ing.unit) {
        alert('All ingredients must have quantity and unit');
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', this.recipe.title || '');
    formData.append('description', this.recipe.description || '');
    formData.append('category', this.recipe.category || 'BREAKFAST');
    formData.append('servings', String(this.recipe.servings || 1));
    formData.append('instructions', this.recipe.instructions || '');

    if (this.recipe.image instanceof File) {
      formData.append('image', this.recipe.image);
    }

    if (this.recipe.pdf_file instanceof File) {
      formData.append('pdf_file', this.recipe.pdf_file);
    }

    const ingredientPayload = this.selectedIngredients.map((ing: any) => ({
      ingredient: ing.ingredient,
      quantity: ing.quantity,
      unit: ing.unit,
    }));

    formData.append('ingredients_data', JSON.stringify(ingredientPayload));

    const request = this.recipeService.addRecipe(formData);

    request.subscribe(
      () => {
        this.router.navigate(['/']);
      },
      (err) => {
        console.error('Save failed:', err);
        if (err.status === 401 || err.status === 403) {
          alert('You must be logged in to save recipes.');
          this.router.navigate(['/login']);
        } else {
          alert('Failed to save recipe. Check console for details.');
        }
      },
    );
  }
}
