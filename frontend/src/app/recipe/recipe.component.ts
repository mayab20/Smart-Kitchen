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
}
