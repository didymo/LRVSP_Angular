import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GraphicalNode} from "../simulation-node";

@Component({
  selector: 'app-graph-data-detail',
  standalone: true,
  imports: [],
  templateUrl: './graph-data-detail.component.html',
  styleUrl: './graph-data-detail.component.scss'
})
export class GraphDataDetailComponent {
  @Input() node!: GraphicalNode | null
  @Output() explore = new EventEmitter<GraphicalNode>
  @Output() unexplore = new EventEmitter<GraphicalNode>
}
