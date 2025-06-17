import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { AvatarModule } from 'primeng/avatar';
import { ImageUploadService } from '../../services/image-upload.service';
import { jwtDecode } from 'jwt-decode';
import { userData } from '../../models/user.interface';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [FontAwesomeModule, AvatarModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  private getImageService = inject(ImageUploadService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private authService = inject(AuthService);
  faSignOut = faSignOut;
  profileImageUrl: string = '';

  getProfileImage() {
    const accessToken = this.authService.getValidToken();
    if (!accessToken) {
      console.error('No valid access token found');
      return;
    }

    const decodedToken: any = jwtDecode(accessToken);
    const userID = decodedToken.user_id;
    const userData = this.getImageService.getProfileImage(userID).subscribe({
      next: (response: userData) => {
        this.profileImageUrl = response.data.profilePicture;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  goToUpload() {
    this.router.navigate(['/upload']);
  }

  ngOnInit(): void {
    this.getProfileImage();
  }
}
