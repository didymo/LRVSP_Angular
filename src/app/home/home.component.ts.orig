import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons/faSearch";
import {faCog} from "@fortawesome/free-solid-svg-icons/faCog";
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    RouterLink,
    FaIconComponent
  ],
  styleUrls: ['./home.component.css'],

  animations: [
  trigger('routeAnimation', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-in', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('300ms ease-out', style({ opacity: 0 }))
    ])
  ])
]
})
export class HomeComponent {
  protected readonly faSearch = faSearch;
  protected readonly faCog = faCog;


}
