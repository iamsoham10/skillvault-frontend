import {
  Component,
  ViewChild,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ImageUploadService } from '../../services/image-upload.service';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-profile-upload',
  imports: [FontAwesomeModule, CommonModule, ProgressSpinner],
  templateUrl: './profile-upload.component.html',
  styleUrl: './profile-upload.component.css',
})
export class ProfileUploadComponent {
  faUpload = faUpload;
  private router = inject(Router);
  private imageUploadService = inject(ImageUploadService);

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  imageUploadLoading = signal(false);

  onUploadClick() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed!');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB!');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onRemoveClick() {
    this.selectedImage = null;
    this.selectedFile = null;
  }

  onSkipForNow() {
    this.selectedImage = null;
    this.selectedFile = null;
    this.router.navigate(['/dashboard']);
  }

  onSaveClick() {
    if (!this.selectedFile) {
      alert('Please upload an image first!');
      return;
    }
    this.imageUploadLoading.set(true);
    const accessToken: string | null = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Access token not found');
    }
    const decodedToken: any = jwtDecode(accessToken);
    const userID = decodedToken.user_id;
    const formData = new FormData();
    formData.append('imageFile', this.selectedFile);
    formData.append('user_id', userID);
    this.imageUploadService.uploadImage(formData).subscribe({
      next: () => {
        this.imageUploadLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.imageUploadLoading.set(false);
        alert('Image upload failed!');
      },
    });
  }
}
