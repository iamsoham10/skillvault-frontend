import { Component } from '@angular/core';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TimelineModule } from 'primeng/timeline';

interface EventItem {
  status: string;
  info: string;
  color: string;
  image?: string;
}
@Component({
  selector: 'app-feature-section',
  imports: [CardModule, TimelineModule, ChipModule, AnimateOnScroll],
  templateUrl: './workflow-section.component.html',
  styleUrl: './workflow-section.component.css'
})
export class FeatureSectionComponent {
  readonly events: EventItem[] = [
    {
      status: 'Save Resources From Anywhere',
      info: 'Use our browser extension to instantly save any useful resource you come across online. Just one click, and it is saved to your SkillVault account.',
      color: '#e6e9ef'
    },
    {
      status: 'Organize Your Collection',
      info: 'Categorize resources into collections with custom tags. Our smart system helps automate organization based on content, making it easy to structure your learning materials.',
      color: '#89acdc'
    },
    {
      status: 'Find and Access Instantly',
      info: 'Never lose valuable resources again. Our powerful search helps you find exactly what you need when you need it, searching across titles, descriptions, and tags.',
      color: '#1a4f99'
    },
    {
      status: 'Collaborate and Share',
      info: 'Learning is better together. Easily share your collections with friends, colleagues, or study groups, with granular control over who can view or edit.',
      color: '#3684f2'
    }
  ];
}
