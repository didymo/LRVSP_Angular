import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    RouterLink
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class LoginComponent {

}
