import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import { Router } from '@angular/router';

interface User {
  uid: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authErrorMessages$ = new BehaviorSubject<string|null>(null);
  public isLoading$ = new BehaviorSubject<boolean>(true);
  public user$ = new BehaviorSubject<User|null>(null);

  private authState:User|null = null;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.isLoggedIn().subscribe(user => {
      if (user) {
        this.authState = user;
        this.router.navigateByUrl('/notes');
      }
    });
  }

  get authenticated(): boolean {
    return this.authState !== null;
  }

  get id(): string {
    return this.authenticated ? this.authState!.uid : '';
  }

  private isLoggedIn(): Observable<User | null> {
    return this.afAuth.authState.pipe(
      map((user:any) => {
        if (user) {
          const { email, uid } = user;
          this.user$.next({ email, uid });
          return { email, uid };
        }
        return null;
      }),
      tap(() => this.isLoading$.next(false))
    );
  }

  public getToken(): Observable<string|null> {
    return this.afAuth.idToken;
  }

  public getCurrentUserUid(): any | null {
    // return this.afAuth.auth.currentUser.uid;
    return this.afAuth.currentUser.then((user:any) => {return user.uid})
  }

  // public signUpFirebase({ email, password }) {
    public signUpFirebase( {email, password}:any){
    this.isLoading$.next(true);
    this.handleErrorOrSuccess(() => {
      // return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
      return this.afAuth.createUserWithEmailAndPassword(email,password)
    });
  }

  // public loginFirebase({ email, password }) {
    public loginFirebase( {email, password }:any) {
    this.isLoading$.next(true);
    this.handleErrorOrSuccess(() => {
      // return this.afAuth.auth.signInWithEmailAndPassword(email, password);
      return this.afAuth.signInWithEmailAndPassword(email, password);
    });
  }

  public logOutFirebase() {
    this.isLoading$.next(true);
    // return this.afAuth.auth.signOut();
    return this.afAuth.signOut();
  }

  private handleErrorOrSuccess(
    // cb: () => Promise<firebase.auth.UserCredential>
    cb: () => Promise<firebase.default.auth.UserCredential>
  ) {
    cb()
      .then(data => this.authenticateUser(data))
      .catch(e => this.handleSignUpLoginError(e));
  }

  private authenticateUser(UserCredential:any) {
    const {
      user: { email, uid }
    } = UserCredential;

    this.isLoading$.next(false);
  }

  private handleSignUpLoginError(error: { code: string; message: string }) {
    this.isLoading$.next(false);
    const errorMessage = error.message;
    this.authErrorMessages$.next(errorMessage);
  }
}
