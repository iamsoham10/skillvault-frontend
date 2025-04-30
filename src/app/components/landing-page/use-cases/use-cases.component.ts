import { Component } from '@angular/core';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

interface UseCase {
  title: string;
  description: string;
  bgColor: string;
  iconBgColor: string;
  iconPath: string;
  benefits: string[];
}

@Component({
  selector: 'app-use-cases',
  imports: [CardModule, ChipModule, AnimateOnScroll],
  templateUrl: './use-cases.component.html',
  styleUrl: './use-cases.component.css'
})
export class UseCasesComponent {
  readonly headerText = {
    title: 'Perfect for all types of learners',
    subtitle: 'Discover how SkillVault can help different types of users organize their learning materials effectively.'
  };

  readonly useCases: UseCase[] = [
    {
      title: 'Developers',
      description: 'Keep track of all the tutorials, documentation, Stack Overflow threads, and GitHub repositories you encounter while coding.',
      bgColor: '!bg-indigo-400',
      iconBgColor: 'bg-indigo-600',
      iconPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      benefits: [
        'Manage important documentation links for quick reference',
        'Build a personal library of programming references',
        'Collaborate with team members on shared resources'
      ]
    },
    {
      title: 'Students & Researchers',
      description: 'Keep your academic resources organized by subjects, papers, or research topics. Never lose that important journal article again.',
      bgColor: '!bg-green-300',
      iconBgColor: 'bg-green-600',
      iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      benefits: [
        'Categorize resources by courses or research topics',
        'Share academic resources with study groups',
        'Build a personal digital library for research'
      ]
    },
    {
      title: 'Professional Teams',
      description: 'Teams can collaborate on shared resource libraries, ensuring everyone has access to the latest information and documentation.',
      bgColor: '!bg-amber-300',
      iconBgColor: 'bg-amber-600',
      iconPath: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      benefits: [
        'Create team knowledge bases with fine-grained permissions',
        'Organize resources by departments or projects',
        'Set permissions for team members on shared collections'
      ]
    }
  ];
}