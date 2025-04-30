import { Component, EventEmitter, inject, Output } from '@angular/core';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import {
  FormBuilder,
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CollectionService } from '../../../../services/collection.service';
import { Collection } from '../../../../models/collection.model';

@Component({
  selector: 'app-add-collection',
  imports: [
    FontAwesomeModule,
    ButtonModule,
    Tooltip,
    Dialog,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    RippleModule,
  ],
  providers: [MessageService],
  templateUrl: './add-collection.component.html',
  styleUrl: './add-collection.component.css',
})
export class AddCollectionComponent {
  @Output() addNewCollection: EventEmitter<Collection> = new EventEmitter();
  private messageService = inject(MessageService);
  private collectionService = inject(CollectionService);
  faAdd = faAdd;
  visible: boolean = false;

  showBottomRightSuccess() {
    // toast message for successful collection creation
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Collection created successfully',
      key: 'br',
      life: 2000,
    });
  }
  showBottomRightFailer() {
    // toast message for failed collection creation
    this.messageService.add({
      severity: 'error',
      summary: 'Failer',
      detail: 'Collection creation failed',
      key: 'br',
      life: 2000,
    });
  }

  private fb = inject(FormBuilder);

  collectionForm: FormGroup = this.fb.nonNullable.group({
    title: ['', { validators: [Validators.required] }],
  });

  onCollectionSubmit() {
    if (this.collectionForm.valid) {
      this.collectionService
        .addCollection(this.collectionForm.value)
        .subscribe({
          next: (response) => {
            console.log(response);
            this.addNewCollection.emit(response.collection);
            this.showBottomRightSuccess();
            this.collectionForm.reset();
          },
          error: (err) => {
            console.log(err);
            this.showBottomRightFailer();
          },
        });
      this.visible = false;
    }
  }

  showDialog() {
    this.visible = true;
  }
}
