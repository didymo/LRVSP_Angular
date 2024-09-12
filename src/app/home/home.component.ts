import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons/faSearch";
import {faCog} from "@fortawesome/free-solid-svg-icons/faCog";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    RouterLink,
    FaIconComponent
  ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  protected readonly faSearch = faSearch;
  protected readonly faCog = faCog;
}
