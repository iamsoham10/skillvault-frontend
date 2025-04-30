import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  OnDestroy,
} from '@angular/core';
import { CollectionService } from '../../../services/collection.service';
import { Collection } from '../../../models/collection.model';
import { CommonModule, NgForOf } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCoffee,
  faShare,
  faTrash,
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { SearchComponent } from './search/search.component';
import { PaginationComponent } from '../../../shared/navbar/pagination/pagination.component';
import { AddCollectionComponent } from './add-collection/add-collection.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { Popover } from 'primeng/popover';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface Role {
  type: string;
}

@Component({
  selector: 'app-collections',
  imports: [
    NgForOf,
    FontAwesomeModule,
    SearchComponent,
    PaginationComponent,
    AddCollectionComponent,
    ProgressSpinnerModule,
    CommonModule,
    Popover,
    InputGroup,
    InputGroupAddonModule,
    InputTextModule,
    ButtonModule,
    Select,
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsComponent implements OnInit, OnDestroy {
  collections = signal<Collection[] | undefined>(undefined);
  isLoading = signal(false);
  collectionFetchError = signal<string | null>(null);
  private destroy$ = new Subject<void>();
  page = signal(1);
  limit = signal(10);
  totalRecords = signal(0);
  faCoffee = faCoffee;
  faDotCircle = faEllipsisV;
  faShare = faShare;
  faTrash = faTrash;
  private router = inject(Router);
  private collectionsService = inject(CollectionService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  openMenu: string | null = null;

  roles: Role[] | undefined;

  selectedRole: Role | undefined;
  shareEmail: string | null = null;

  toggleMenu(title: string) {
    this.openMenu = this.openMenu === title ? null : title;
  }

  ngOnInit() {
    this.loadCollections();
    this.roles = [{ type: 'Viewer' }, { type: 'Editor' }];
  }

  deleteCollection(collection: Collection) {
    console.log('deleted');
    const collection_ID = collection._id;
    const user_ID = this.userService.getUserID();
    this.collectionsService
      .deleteCollection(collection_ID, user_ID ?? '')
      .subscribe({
        next: () => {
          console.log('Collection deleted successfully');
          this.collections.update((currentCollections) => {
            if (currentCollections) {
              return currentCollections.filter(
                (collection) => collection._id !== collection_ID
              );
            }
            return currentCollections;
          });
        },
        error: (err) => {
          console.error('Error deleting collection', err);
        },
      });
    this.openMenu = null;
  }

    showBottomRightSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Collection shared successfully',
      key: 'br',
      life: 2000,
    });
  }
  showBottomRightFailer() {
    this.messageService.add({
      severity: 'error',
      summary: 'Failer',
      detail: 'Collection sharing failed',
      key: 'br',
      life: 2000,
    });
  }

  shareCollection(collection_id: string, shareUserEmail: string, role: string) {
    console.log('Share collection');
    console.log(collection_id)
    console.log(shareUserEmail);
    console.log(role.toLowerCase());
    this.collectionsService.shareCollection(shareUserEmail, collection_id, role.toLowerCase()).subscribe({
      next: () => {
        console.log('collection shared successfully with', shareUserEmail);
        this.showBottomRightSuccess();
      },
      error: (err) => {
        console.error('Error sharing collection:', err);
        this.showBottomRightFailer();
      }
    });
    this.openMenu = null;
  }

  showResources(collection: Collection) {
    const collection_ID = collection._id;
    this.router.navigate(['/dashboard/resources', collection_ID]);
  }

  loadPage(newPage: number): void {
    this.page.set(newPage);
    this.loadCollections();
  }

  loadCollections(): void {
    this.isLoading.set(true);
    this.collectionFetchError.set(null);

    this.collectionsService
      .getCollections(this.page(), this.limit())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.collections.set(response.AllCollections.collections);
          this.totalRecords.set(response.AllCollections.totalNoOfCollections);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.collectionFetchError.set('Failed to load collections');
          this.isLoading.set(false);
          console.error('Error loading collections', err);
        },
      });
  }

  updateCollections(newCollections: Collection[]): void {
    this.collections.set(newCollections);
  }

  onCollectionAdded(newCollection: Collection) {
    this.collections.update((collection) => {
      if (collection === undefined) {
        return [newCollection];
      } else {
        collection.push(newCollection);
        return collection;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
