import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss']
})
export class RecipeFormComponent implements OnInit {

  recipe: any = {
    title: '',
    description: '',
    category: 'OTHER',
    servings: 1,
    instructions: '',
    image: null,
    pdf_file: null
  };

    recipeCategories = [
    { value: 'SALAD', label: 'Salad' },
    { value: 'SOUP', label: 'Soup' },
    { value: 'APPETIZER', label: 'Appetizer' },
    { value: 'MAIN', label: 'Main Course' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'DRINK', label: 'Drink' },
    { value: 'OTHER', label: 'Other' }
  ];

  selectedIngredients: any[] = [];
  suggestions: any[] = [];
  ingredientSearch = '';
  showSuggestions = false;
  private searchSubject = new Subject<string>();

  isEditMode = false;
  recipeId: any;

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.recipeId = this.route.snapshot.params['id'];

    if (this.recipeId) {
      this.isEditMode = true;
      this.recipeService.getRecipes().subscribe(data => {
        const found = data.find((r: any) => r.id == this.recipeId);
        if (found) {
          this.recipe = found;
          if (found.recipe_ingredients) {
            this.selectedIngredients = found.recipe_ingredients.map((ri: any) => ({
              ingredient: ri.ingredient,
              name: ri.ingredient_name,
              quantity: ri.quantity,
              unit: ri.unit,
              allowed_units: ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'pinch', 'slice'] // Default units
            }));
          }
        }
      });
    }

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.recipeService.searchItems(query))
    ).subscribe({
      next: data => this.suggestions = data,
      error: err => console.error('Search failed:', err)
    });
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
    this.showSuggestions = false;
  }

  removeIngredient(id: number) {
    this.selectedIngredients = this.selectedIngredients.filter(i => i.ingredient !== id);
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    this.recipe[field] = file;
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
    for (let key in this.recipe) {
      const value = this.recipe[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    }

    const ingredientPayload = this.selectedIngredients.map((ing: any) => ({
      ingredient: ing.ingredient,
      quantity: ing.quantity,
      unit: ing.unit
    }));

    formData.append('ingredients_data', JSON.stringify(ingredientPayload));

    const request = this.isEditMode
      ? this.recipeService.updateRecipe(this.recipeId, formData)
      : this.recipeService.addRecipe(formData);

    request.subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
