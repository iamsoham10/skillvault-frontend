import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { userData } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private http = inject(HttpClient);
  private AUTH_URL = environment.AUTH_API;

  uploadImage(FormData: FormData): Observable<Object> {
    return this.http.post(`${this.AUTH_URL}upload-image`, FormData);
  }

  getProfileImage(userID: string): Observable<userData> {
    return this.http.get<userData>(`${this.AUTH_URL}user/${userID}`);
  }
}
