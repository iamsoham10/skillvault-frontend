import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faAdd, faClose } from '@fortawesome/free-solid-svg-icons';
import { CollectionService } from '../../../../services/collection.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Collection } from '../../../../models/collection.model';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ResourceService } from '../../../../services/resource.service';

@Component({
  selector: 'app-search',
  imports: [
    FontAwesomeModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnInit {
  @Output() searchResults = new EventEmitter<Collection[]>();
  faSearch = faSearch;
  faAdd = faAdd;
  faCancel = faClose;
  searchValue = '';
  private destroy$ = new Subject<void>();
  private searchService = inject(CollectionService);
  private resourceService = inject(ResourceService);
  private fb = inject(FormBuilder);

  searchForm = this.fb.nonNullable.group({
    searchTerm: '',
  });

  searchCollections() {
    const searchTerm = this.searchForm.value.searchTerm?.trim();
    if (searchTerm) {
      this.searchService
        .searchCollections(this.searchValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe((searchAPIResults) => {
          this.searchResults.emit(searchAPIResults.collections);
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
    this.searchService
      .getCollections(1, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe((collections) => {
        this.searchResults.emit(collections.AllCollections.collections);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
