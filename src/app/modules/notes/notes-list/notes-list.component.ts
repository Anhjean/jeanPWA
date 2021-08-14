import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../core/data.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AddToHomeScreenService } from '../../core/add-to-home-screen.service';

interface Note {
  key: string;
  title: string;
  contnet: string;
  date: string;
}

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss']
})
export class NotesListComponent implements OnInit {
  notes$!: Observable<Note[]>;
  isDbLoading$!:BehaviorSubject<boolean>;
  isAddToHomeScreenEnabled$:any;
   notes:any;


  constructor(private db: DataService, private a2hs: AddToHomeScreenService) {}

  ngOnInit() {
    // this.notes$ = this.db.getNotes();
    this.notes$ = this.db.initializeNotes();
    this.notes$.subscribe(n => {
      this.notes = n;
      console.log('Note-list: ',n)})
    this.isDbLoading$ = this.db.isLoading$;
    this.isAddToHomeScreenEnabled$ = this.a2hs.deferredPromptFired;
  }

  showPrompt() {
    this.a2hs.showPrompt();
  }
}
