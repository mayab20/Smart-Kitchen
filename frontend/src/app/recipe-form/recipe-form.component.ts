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
    instructions: '',
    image: null,
    pdf_file: null
  };

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
        if (found) this.recipe = found;
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
