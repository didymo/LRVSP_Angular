import {Component, ViewChild} from '@angular/core';
import {GraphDataSelectorComponent} from "../graph-data-selector/graph-data-selector.component";
import {GraphDataDisplayComponent} from "../graph-data-display/graph-data-display.component";
import {GraphDataDetailComponent} from "../graph-data-detail/graph-data-detail.component";
import {GraphicalNode} from "../simulation-node";
import {GraphDataService} from "../graph-data.service";

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

  // This method needs to be cleaned up - it's a vestige of when some visibility management happened in this component
  // as opposed to in the GraphDataDisplay component. We should really just let the displayComponent decide what happens
  // with duplicate nodes.
  makeVisible(node: GraphicalNode) {
    if (!this.visibleNodes.includes(node)) {
      this.visibleNodes.push(node)
      this.displayComponent.addNode(node);
    }

  }

  // Fired when the user makes a selection in GraphDataSelector
  dropDownSelect(event: GraphicalNode) {
    //Reset the fixed state of all nodes of interest - we're starting over.
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
