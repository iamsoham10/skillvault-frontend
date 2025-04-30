import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResourceRecommendations } from '../models/resource.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  private readonly RECOMMENDATION_URL =
    'http://127.0.0.1:3000/api/recommend/send-resources';
  private http = inject(HttpClient);
  getRecommendations(
    collection_id: string
  ): Observable<ResourceRecommendations> {
    return this.http.post<ResourceRecommendations>(this.RECOMMENDATION_URL, {
      collection_id,
    });
  }
}
