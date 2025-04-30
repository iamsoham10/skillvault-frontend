import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { HeroSectionComponent } from "./hero-section/hero-section.component";
import { FeatureSectionComponent } from "./workflow-section/workflow-section.component";
import { UseCasesComponent } from "./use-cases/use-cases.component";



@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ButtonModule, ChipModule, CardModule, CommonModule, AnimateOnScrollModule, HeroSectionComponent, HeroSectionComponent, FeatureSectionComponent, UseCasesComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
