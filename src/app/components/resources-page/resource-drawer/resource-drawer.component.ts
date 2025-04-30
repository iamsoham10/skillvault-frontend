import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Resource } from '../../../models/resource.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-resource-drawer',
  imports: [ReactiveFormsModule],
  templateUrl: './resource-drawer.component.html',
  styleUrl: './resource-drawer.component.css',
})
export class ResourceDrawerComponent {
  private fb = inject(FormBuilder);
  @Input() resource: Resource | null = null;
  @Output() saveResource = new EventEmitter<Resource>();
  @Output() deleteResource = new EventEmitter<Resource>();

  resourceForm: FormGroup = this.fb.group({
    title: [''],
    url: [''],
    description: [''],
    tags: [''],
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resource'] && this.resource) {
      this.resourceForm.patchValue({
        title: this.resource.title,
        url: this.resource.url,
        description: this.resource.description,
        tags: this.resource.tags?.join(', ') || '',
      });
    }
  }

  onSave() {
    const formValue = this.resourceForm.value;
    const tags = formValue.tags
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag);
    const updatedFields: any = {};
    if (formValue.title !== this.resource?.title)
      updatedFields.title = formValue.title;
    if (formValue.url !== this.resource?.url) updatedFields.url = formValue.url;
    if (formValue.description !== this.resource?.description)
      updatedFields.description = formValue.description;
    const originalTags = this.resource?.tags.join(',') || '';
    if (
      formValue.tags.replace(/\s+/g, '') !== originalTags.replace(/\s/g, '')
    ) {
      updatedFields.tags = tags;
    }
    this.saveResource.emit(updatedFields);
  }

  onDelete() {
    this.deleteResource.emit();
  }
}
