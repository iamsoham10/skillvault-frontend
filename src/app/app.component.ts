import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(private authService: AuthService){
    this.initializeAuth();
  }

  private initializeAuth(): void{
    if(this.authService.isUserAuthenticated()){
      if(this.authService.isTokenExpiringSoon()){
        this.authService.getAccessToken().subscribe({
          next: () => console.log('token refresh successful'),
          error: (error) => {
            this.authService.logOut();
          }
        })
      }
    }
  }
  title = 'skillvault';
}
