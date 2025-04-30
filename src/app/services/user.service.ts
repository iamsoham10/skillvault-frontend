import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly userID_KEY = 'userID';
  setUserID(id: string): void {
    localStorage.setItem(this.userID_KEY, id);
  }

  getUserID(): string | null {
    const storedUserID = localStorage.getItem(this.userID_KEY);
    return storedUserID;
  }
}
