import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../services/recipe.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {

  recipe: any;

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];

    this.recipeService.getRecipes().subscribe(data => {
      this.recipe = data.find(r => r.id == id);
      console.log(data);
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

  getPdfUrl(pdfPath: string): string {
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