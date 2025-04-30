import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CollectionSearchAPIResponse } from '../models/collection.interface';
import { Observable } from 'rxjs';
import {
  ResourceAddAPIResonse,
  ResourceAPIResponse,
  ResourceSearchAPIResponse,
} from '../models/resource.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http = inject(HttpClient);

  getResources(
    collection_id: string,
    page: number,
    limit: number
  ): Observable<ResourceAPIResponse> {
    return this.http.get<ResourceAPIResponse>(
      `${environment.RESOURCE_API}all-resources?collection_id=${collection_id}&page=${page}&limit=${limit}`
    );
  }

  searchResources(
    collection_id: string,
    search: string
  ): Observable<ResourceSearchAPIResponse> {
    return this.http.get<ResourceSearchAPIResponse>(
      `${environment.RESOURCE_API}search?collection_id=${collection_id}&search=${search}`
    );
  }

  addResource(
    collection_ID: string,
    resourceData: {
      title: string;
      url: string;
      description: string;
      tags: Array<string>;
    }
  ): Observable<ResourceAddAPIResonse> {
    return this.http.post<ResourceAddAPIResonse>(
      `${environment.RESOURCE_API}new-resource?collection_id=${collection_ID}`,
      resourceData
    );
  }

  updateResource(
    editData: {
      title?: string;
      url?: string;
      description?: string;
      tags?: Array<string>;
    },
    resource_id: string
  ): Observable<Object> {
    return this.http.put(
      `${environment.RESOURCE_API}update-resource?_id=${resource_id}`,
      editData
    );
  }

  deleteResource(resource_id: string) {
    return this.http.delete(`${environment.RESOURCE_API}delete-resource?_id=${resource_id}`);
  }
}
