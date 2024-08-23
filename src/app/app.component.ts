import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GraphDataManagerComponent} from "./graph-data-manager/graph-data-manager.component";
import {TreeDataManagerComponent} from "./tree-data-manager/tree-data-manager.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GraphDataManagerComponent, TreeDataManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'LegislativeRelationshipVisualisation';
}
