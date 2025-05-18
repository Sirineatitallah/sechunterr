import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recent-memos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-memos.component.html',
  styleUrls: ['./recent-memos.component.scss']
})
export class RecentMemosComponent {
  memos = [
    { id: 1, title: 'Memo 1', date: '2024-06-01', content: 'This is the first memo.' },
    { id: 2, title: 'Memo 2', date: '2024-06-02', content: 'This is the second memo.' },
    { id: 3, title: 'Memo 3', date: '2024-06-03', content: 'This is the third memo.' }
  ];
}
