import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  items: any[] = [];
  selectedIngredients: any[] = [];
  isEditMode = false;
  recipeId: any;

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.recipeId = this.route.snapshot.params['id'];
    this.recipeService.getItems().subscribe(data => {
    this.items = data;
  });

    if (this.recipeId) {
      this.isEditMode = true;
      this.recipeService.getRecipes().subscribe(data => {
        const found = data.find(r => r.id == this.recipeId);
        if (found) this.recipe = found;
      });
    }
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    this.recipe[field] = file;
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
    formData.append(key, this.recipe[key]);
  }

  formData.append('ingredients_data', JSON.stringify(this.selectedIngredients));

  this.recipeService.addRecipe(formData).subscribe(() => {
    this.router.navigate(['/']);
  });
}
}