import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TreeDataManagerComponent} from "./_components/tree-data-manager/tree-data-manager.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TreeDataManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'LegislativeRelationshipVisualisation';
}
