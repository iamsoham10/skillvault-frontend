import { Component, ViewChild } from '@angular/core';
import { AnimateOnScroll } from 'primeng/animateonscroll';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { AuthSectionComponent } from '../auth-section/auth-section.component';

@Component({
  selector: 'app-hero-section',
  imports: [CardModule, ButtonModule, ChipModule, AnimateOnScroll, InputTextModule, CommonModule, AuthSectionComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent {
  @ViewChild(AuthSectionComponent) authDialog!: AuthSectionComponent;

  onGetStarted(): void {
    this.authDialog.showDialog();
  }
}