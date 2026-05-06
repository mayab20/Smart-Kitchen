import { RecipeFormComponent } from './recipe-form/recipe-form.component';
import { RecipeDetailComponent } from './recipe-detail/recipe-detail.component';
import { RecipesComponent } from './recipe/recipe.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { PantryComponent } from './pantry/pantry.component';
import { ProfileComponent } from './profile/profile.component';

export const routes = [
  { path: '', component: RecipesComponent },
  { path: 'add', component: RecipeFormComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'pantry', component: PantryComponent },
  { path: 'profile', component: ProfileComponent },
];
