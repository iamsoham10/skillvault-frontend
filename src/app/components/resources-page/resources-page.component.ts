import { Component, inject, OnInit, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { Resource } from '../../models/resource.model';
import { ResourceService } from '../../services/resource.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginationComponent } from '../../shared/navbar/pagination/pagination.component';
import { AddResourceComponent } from './add-resource/add-resource.component';
import { SearchResourceComponent } from './search-resource/search-resource.component';
import { RecommendationService } from '../../services/recommendation.service';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { ResourceDrawerComponent } from './resource-drawer/resource-drawer.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-resources-page',
  imports: [
    NavbarComponent,
    CommonModule,
    ProgressSpinnerModule,
    PaginationComponent,
    AddResourceComponent,
    SearchResourceComponent,
    DrawerModule,
    ButtonModule,
    FontAwesomeModule,
    ResourceDrawerComponent,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './resources-page.component.html',
  styleUrl: './resources-page.component.css',
})
export class ResourcesPageComponent implements OnInit {
  userResources = signal<Resource[] | undefined>(undefined);
  recommendedResources = signal<{ title: string; link: string }[] | undefined>(undefined);
  collection_ID: string | null = null;
  isResourcesLoading = signal(false);
  totalResources = signal(0);
  page = signal(1);
  limit = signal(10);
  isRecommendationsLoading = signal(false);
  drawerVisible: boolean = false;
  selectedResource: Resource | null = null;
  faEdit = faEdit;
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private resourceService = inject(ResourceService);
  private recommendationService = inject(RecommendationService);
  private messageService = inject(MessageService);

  loadResources(collection_ID: string): void {
    this.isResourcesLoading.set(true);
    this.resourceService
      .getResources(collection_ID, this.page(), this.limit())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log(response);
          this.userResources.set(response.resources.resources);
          this.totalResources.set(response.resources.totalResources);
          this.isResourcesLoading.set(false);
        },
        error: (err) => {
          console.log(err);
          this.isResourcesLoading.set(false);
        },
      });
  }
  loadPage(newPage: number): void {
    this.page.set(newPage);
    this.loadResources(this.collection_ID!);
  }

  onResourceAdded(newResource: Resource) {
    this.loadResources(this.collection_ID!);
  }

  onSearchResults(results: Resource[]) {
    this.userResources.set(results);
  }

  fetchRecommendations() {
    this.isRecommendationsLoading.set(true);
    this.recommendationService
      .getRecommendations(this.collection_ID!)
      .subscribe({
        next: (response) => {
          this.isRecommendationsLoading.set(false);
          console.log(response);
          const flattened = response.data.recommendations.flat();
          this.recommendedResources.set(flattened);
        },
        error: (err) => {
          this.isRecommendationsLoading.set(false);
          console.log(err);
        }
      });
  }

  openResourceDrawer(resource: Resource) {
    this.selectedResource = resource;
    this.drawerVisible = true;
    console.log(resource);
  }

  onSaveResource(changes: any) {
    this.resourceService
      .updateResource(changes, this.selectedResource!._id)
      .subscribe({
        next: (response) => {
          console.log('resource updated successfully');
          console.log(response);
          this.drawerVisible = false;
          this.showToast('success', 'Resource updated successfully');
          this.loadResources(this.collection_ID!);
        },
        error: (err) => {
          console.log('Error updating resource');
          this.drawerVisible = false;
          this.showToast('error', 'Failed to update resource');
        },
      });
  }

  onDeleteResource() {
    const resource_id = this.selectedResource!._id;
    this.resourceService.deleteResource(resource_id).subscribe({
      next: (response) => {
        this.drawerVisible = false;
        this.showToast('success', 'Resource deleted successfully');
        this.loadResources(this.collection_ID!);
      },
      error: (err) => {
        this.drawerVisible = false;
        this.showToast('error', 'Failed to delete resource');
      },
    });
  }

  private showToast(severity: 'success' | 'error', detail: string) {
    this.messageService.add({
      severity,
      summary: severity === 'success' ? 'Success' : 'Error',
      detail,
      key: 'br',
      life: 2000,
    });
  }

  ngOnInit(): void {
    this.collection_ID = this.route.snapshot.paramMap.get('collection_ID');
    if (this.collection_ID) {
      this.loadResources(this.collection_ID);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
