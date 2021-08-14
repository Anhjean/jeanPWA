import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-note-card',
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss']
})
export class NoteCardComponent {
  @Input()
  note:any|unknown;

  @Input()
  loading!: boolean;

  @Input()
  edit = true;
}
