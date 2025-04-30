import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Resource } from '../../../models/resource.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { ButtonModule } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ResourceService } from '../../../services/resource.service';

@Component({
  selector: 'app-add-resource',
  standalone: true,
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
  templateUrl: './add-resource.component.html',
  styleUrls: ['./add-resource.component.css'],
})
export class AddResourceComponent {
  @Output() addNewResource = new EventEmitter<Resource>();
  @Input() userCollection_ID: string | null = '';
  visible = false;
  faAdd = faAdd;

  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private resourceService = inject(ResourceService);

  resourceForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    url: ['', [Validators.required]],
    description: [''],
    tags: [''],
  });

  showDialog() {
    this.visible = true;
  }

  onResourceSubmit() {
    if (this.resourceForm.valid) {
      const newResource = {
        ...this.resourceForm.value,
        tags: this.resourceForm.value.tags
          .split(',')
          .map((tag: string) => tag.trim()),
      };

      this.resourceService
        .addResource(this.userCollection_ID!, newResource)
        .subscribe({
          next: (res) => {
            this.visible = false;
            this.addNewResource.emit(res.resource);
            this.showToast('success', 'Resource created successfully');
            this.resourceForm.reset();
          },
          error: (err) => {
            console.error(err);
            this.visible = false;
            this.resourceForm.reset();
            this.showToast('error', 'Failed to create resource');
          },
        });
    }
    console.log(this.resourceForm.value);
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
}
