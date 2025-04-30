import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Collection } from '../models/collection.model';
import { jwtDecode } from 'jwt-decode';
import {
  CollectionAPIResponse,
  CollectionSearchAPIResponse,
  CollectionAddResponse,
  DecodedToken,
} from '../models/collection.interface';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private http = inject(HttpClient);

  getCollections(
    page: number,
    limit: number
  ): Observable<CollectionAPIResponse> {
    return this.http.get<CollectionAPIResponse>(
      `${environment.COLLECTION_API}all-collection?page=${page}&limit=${limit}`
    );
  }

  searchCollections(search: string): Observable<CollectionSearchAPIResponse> {
    return this.http.post<CollectionSearchAPIResponse>(
      `${environment.COLLECTION_API}search-collection?search=${search}`,
      {}
    );
  }

  addCollection(collectionData: {
    title: string;
  }): Observable<CollectionAddResponse> {
    const accessToken: string | null = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Access token not found');
    }
    const decodedToken: DecodedToken = jwtDecode(accessToken);
    let userID = decodedToken.user_privateID;
    return this.http.post<CollectionAddResponse>(
      `${environment.COLLECTION_API}new-collection?_id=${userID}`, // send _id as query parameter along with the collection title as body
      collectionData
    );
  }

  deleteCollection(collection_id: string, user_id: string): Observable<Object> {
    return this.http.delete(
      `${environment.COLLECTION_API}remove-collection?collection_id=${collection_id}&_id=${user_id}`
    );
  }

  shareCollection(shareUserEmail: string, collection_id: string, role: string): Observable<Object>{
    return this.http.post(
      `${environment.COLLECTION_API}share-collection?collection_id=${collection_id}&role=${role}`,
      {email: shareUserEmail}
    )
  }
}
