import { Component } from '@angular/core';
<<<<<<< HEAD
import { RouterOutlet , RouterLink} from '@angular/router';
=======
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
>>>>>>> b79390174dfbcc4df893cab4adaee3677bbebf74

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
<<<<<<< HEAD
=======

  constructor(public authService: AuthService, private router: Router) {}

  onLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
>>>>>>> b79390174dfbcc4df893cab4adaee3677bbebf74
}
