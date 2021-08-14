import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

interface Note {
  id: string;
  title: string;
  content: string;
}

interface Joke {
  id: string;
  joke: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  protected readonly USERS_COLLECTION = 'users';
  protected readonly NOTES_COLLECTION = 'notes';
  protected readonly FIRESTORE_ENDPOINT =
    'https://firestore.googleapis.com/v1beta1/projects/unibankapp/databases/(default)/documents/';
  protected readonly DAD_JOKE = 'https://icanhazdadjoke.com';
  public isLoading$ = new BehaviorSubject<boolean>(true);

  get timestamp() {
    return new Date().getTime();
  }

  constructor(
    private afDb: AngularFirestore,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  getRandomDadJoke(): Observable<string> {
    return this.http
      .get<Joke>(this.DAD_JOKE, {
        headers: {
          Accept: 'application/json'
        }
      })
      .pipe(map(data => data.joke));
  }

  getUserNotesCollection() {
    return this.afDb.collection(
      this.USERS_COLLECTION + '/' + this.auth.id + '/' + this.NOTES_COLLECTION,
      ref => ref.orderBy('updated_at', 'desc')
    );
  }

  addNote(data:any): Promise<DocumentReference | any> {
    return this.getUserNotesCollection().add({
      ...data,
      created_at: this.timestamp,
      updated_at: this.timestamp
    });
  }

  editNote(id:any, data:any): Promise<void> {
    return this.getUserNotesCollection()
      .doc(id)
      .update({
        ...data,
        updated_at: this.timestamp
      });
  }

  deleteNote(id:any): Promise<void> {
    return this.getUserNotesCollection()
      .doc(id)
      .delete();
  }

  getNoteFromDirectApi(id:any): Observable<any> {
    return this.auth.getToken().pipe(
      switchMap(idToken => {
        return this.http.get(
          `${this.FIRESTORE_ENDPOINT}users/${this.auth.id}/notes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          }
        );
      }),
      map(notes => this.transfromNote(notes))
    );
  }

  getNote(id:any): Observable<any> {
    return this.getUserNotesCollection()
      .doc(id)
      .snapshotChanges()
      .pipe(
        map(snapshot => {
          const data = snapshot.payload.data() as Note;
          const payload_id = snapshot.payload.id;
          return {  ...data,id: payload_id };
        }),
        catchError(e => throwError(e))
      );
  }

  getNotes(): Observable<any> {
    return this.getUserNotesCollection()
      .snapshotChanges()
      .pipe(
        map(snapshot =>
          snapshot.map(a => {
            // Get document data
            const data = a.payload.doc.data() as Note;
            // Get document id
            const id = a.payload.doc.id;
            // Use spread operator to add the id to the document data
            return { ...data,id };
          })
        ),
        tap(notes => {
          this.isLoading$.next(false);
        }),
        catchError(e => throwError(e))
      );
  }

  initializeNotes(): Observable<any>{
    return this.auth.getToken().pipe(
      switchMap((idToken:any) => {
        return this.http.get<any>(
          `${this.FIRESTORE_ENDPOINT}users/${this.auth.id}/notes`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          }
        );
      }),
      map((data: { documents: { fields: {} }[] }) => data.documents),
      map(notes => this.transfromNotes(notes)),
      tap(notes => {
        this.isLoading$.next(false);
      })
    );
  }

  private transfromNotes(notes:any) {
    return notes.map((note:any) => this.transfromNote(note));
  }

  private transfromNote(note:any) {
    // const _note = {};
    let _note = {};
    // _note['id'] = note.name.split('/').reverse()[0];
    _note = {..._note, id: note.name.split('/').reverse()[0]};
    for (const prop in note.fields) {
      if (note.fields[prop]) {
        // _note[prop] =
        //   note.fields[prop]['stringValue'] || note.fields[prop]['integerValue'];
          _note = { ..._note, [prop]: note.fields[prop]['stringValue'] || note.fields[prop]['integerValue'] }

      }
    }
    console.log('Data_services: Transform note: ',_note)
    return _note;
  }
}
