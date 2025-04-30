import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { faAdd, faClose, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { ResourceService } from '../../../services/resource.service';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Resource } from '../../../models/resource.model';

@Component({
  selector: 'app-search-resource',
  imports: [
    FontAwesomeModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './search-resource.component.html',
  styleUrl: './search-resource.component.css',
})
export class SearchResourceComponent {
  @Output() searchResults = new EventEmitter<Resource[]>();
  @Input() userCollection_id: string | null = null;
  faSearch = faSearch;
  faAdd = faAdd;
  faCancel = faClose;
  searchValue = '';
  private destroy$ = new Subject<void>();
  private resourceService = inject(ResourceService);
  private fb = inject(FormBuilder);

  searchForm = this.fb.nonNullable.group({
    searchTerm: '',
  });

  searchCollections() {
    const searchTerm = this.searchForm.value.searchTerm?.trim();
    if (searchTerm) {
      this.resourceService
        .searchResources(this.userCollection_id!, this.searchValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe((searchAPIResults) => {
          this.searchResults.emit(searchAPIResults.resources);
        });
    }
  }

  ngOnInit(): void {
    this.searchCollections();
  }

  onSearchSubmit() {
    this.searchValue = this.searchForm.value.searchTerm || '';
    this.searchCollections();
    console.log(this.searchForm.value, 'submitted');
  }

  clearSearch() {
    // clear the search and refetch data
    this.searchForm.reset();
    this.searchValue = '';
    this.resourceService
      .getResources(this.userCollection_id!, 1, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe((clearSearch) => {
        this.searchResults.emit(clearSearch.resources.resources);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
