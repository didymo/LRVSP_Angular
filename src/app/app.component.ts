import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GraphDataManagerComponent} from "./graph-data-manager/graph-data-manager.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GraphDataManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'LegislativeRelationshipVisualisation';
}
