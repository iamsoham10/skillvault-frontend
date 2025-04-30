import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class EmailService {
  email = signal<string>('');

  setEmail(email: string){
    this.email.set(email);
    console.log(this.email());
  }
}
