import {Component, ViewChild} from '@angular/core';
import {GraphDataSelectorComponent} from "../graph-data-selector/graph-data-selector.component";
import {GraphDataDisplayComponent} from "../graph-data-display/graph-data-display.component";
import {GraphDataDetailComponent} from "../graph-data-detail/graph-data-detail.component";
import {GraphicalNode} from "../simulation-node";
import {GraphDataService} from "../graph-data.service";
import {Data} from "@angular/router";

@Component({
  selector: 'app-graph-data-manager',
  standalone: true,
  imports: [
    GraphDataSelectorComponent,
    GraphDataDisplayComponent,
    GraphDataDetailComponent
  ],
  templateUrl: './graph-data-manager.component.html',
  styleUrl: './graph-data-manager.component.scss'
})
export class GraphDataManagerComponent {
  nodes: GraphicalNode[] = []
  visibleNodes: GraphicalNode[] = []
  detailNode: GraphicalNode | null = null

  @ViewChild(GraphDataDisplayComponent) displayComponent!: GraphDataDisplayComponent;

  constructor(private graphDataService: GraphDataService) {
  }

  ngOnInit() {
    this.graphDataService.getAllDocuments().subscribe((nodes) => {
      this.nodes = nodes;
    })
  }

  makeVisible(node: GraphicalNode) {
    if (!this.visibleNodes.includes(node)) {
      this.visibleNodes.push(node)
      this.displayComponent.addNode(node);
    }

  }

  dropDownSelect(event: GraphicalNode) {
    for (let node of this.nodes) {
      node.fixed = false
      node.fx = null
      node.fy = null
    }
    this.displayComponent.initNodes([])
    this.visibleNodes = []
    this.makeVisible(event)
  }

  nodeSelected(node: GraphicalNode) {
    this.detailNode = node
  }
}
