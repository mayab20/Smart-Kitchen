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
    pdf_file: null,
    recipe_ingredients: []
  };

<<<<<<< HEAD
  recipeCategories = [
    { value: 'SALAD', label: 'Salad' },
    { value: 'SOUP', label: 'Soup' },
    { value: 'APPETIZER', label: 'Appetizer' },
    { value: 'MAIN', label: 'Main Course' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'DRINK', label: 'Drink' },
    { value: 'OTHER', label: 'Other' }
  ];

  items: any[] = [];
=======
>>>>>>> 3512070fa2b056b188bec59d741cc7d9e89be4b7
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
<<<<<<< HEAD
    this.recipeService.getItems().subscribe(data => {
      this.items = data;
    });
=======
>>>>>>> 3512070fa2b056b188bec59d741cc7d9e89be4b7

    if (this.recipeId) {
      this.isEditMode = true;
      this.recipeService.getRecipes().subscribe(data => {
<<<<<<< HEAD
        const found = data.find(r => r.id == this.recipeId);
        if (found) {
          this.recipe = found;
          if (found.recipe_ingredients) {
            this.selectedIngredients = found.recipe_ingredients.map((ri: any) => ({
              ingredient: ri.ingredient,
              quantity: ri.quantity || ''
            }));
          }
        }
=======
        const found = data.find((r: any) => r.id == this.recipeId);
        if (found) this.recipe = found;
>>>>>>> 3512070fa2b056b188bec59d741cc7d9e89be4b7
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
      this.selectedIngredients.push({
        ingredient: item.id,
        name: item.name,
        quantity: '',
        unit: item.allowed_units?.[0] ?? 'NONE',
        allowed_units: item.allowed_units ?? []
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

<<<<<<< HEAD
  isIngredientSelected(itemId: number) {
    return this.selectedIngredients.some(i => i.ingredient === itemId);
  }

  getSelectedIngredient(itemId: number) {
    return this.selectedIngredients.find(i => i.ingredient === itemId);
  }

  toggleIngredient(item: any) {
    const index = this.selectedIngredients.findIndex(i => i.ingredient === item.id);

    if (index > -1) {
      this.selectedIngredients.splice(index, 1);
    } else {
      this.selectedIngredients.push({
        ingredient: item.id,
        quantity: ''
      });
    }
  }

  submit() {
    const formData = new FormData();

    for (let key in this.recipe) {
      const value = this.recipe[key];

      if (key === 'recipe_ingredients') {
        continue;
      }

      if (value === null || value === undefined) {
        continue;
      }

      if ((key === 'image' || key === 'pdf_file') && !(value instanceof File)) {
        continue;
      }

      formData.append(key, value);
    }

    formData.append('ingredients_data', JSON.stringify(this.selectedIngredients));

    const request = this.isEditMode
      ? this.recipeService.updateRecipe(this.recipeId, formData)
      : this.recipeService.addRecipe(formData);

    request.subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
=======
  submit() {
    const formData = new FormData();
    for (let key in this.recipe) {
      if (this.recipe[key] !== null) formData.append(key, this.recipe[key]);
    }
    formData.append('ingredients_data', JSON.stringify(this.selectedIngredients));
    this.recipeService.addRecipe(formData).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
>>>>>>> 3512070fa2b056b188bec59d741cc7d9e89be4b7
