import {Component, ViewChild} from '@angular/core';
import {GraphDataService} from "../graph-data.service";
import {MatSidenavContainer, MatSidenavContent, MatSidenav} from "@angular/material/sidenav";
import {TreeDataDetailComponent} from "../tree-data-detail/tree-data-detail.component";
import {TreeDataDisplayComponent} from "../tree-data-display/tree-data-display.component";
import {TreeDocument} from "../tree-document";
import {TreeNode} from "../tree-node";
import {TreeDataSelectorComponent} from "../tree-data-selector/tree-data-selector.component";

@Component({
  selector: 'app-tree-data-manager',
  standalone: true,
  imports: [
    MatSidenavContent,
    MatSidenavContainer,
    MatSidenav,
    TreeDataDetailComponent,
    TreeDataDisplayComponent,
    TreeDataSelectorComponent
  ],
  templateUrl: './tree-data-manager.component.html',
  styleUrl: './tree-data-manager.component.scss'
})
export class TreeDataManagerComponent {
  nodes: TreeDocument[] = []
  detailNode: TreeNode | null = null

  @ViewChild(TreeDataDisplayComponent) displayComponent!: TreeDataDisplayComponent;
  @ViewChild('detailSidebar') detailSidebar!: MatSidenav;

  constructor(private graphDataService: GraphDataService) {
  }

  ngOnInit() {
    this.graphDataService.getAllDocumentsForTree().subscribe((nodes) => {
      this.nodes = nodes;
    })
  }

  // Fired when the user makes a selection in GraphDataSelector
  dropDownSelect(doc: TreeDocument) {
    this.displayComponent.rootNode = new TreeNode(doc)
  }

  nodeSelected(node: TreeNode) {
    this.detailNode = node
    this.detailSidebar?.open()
  }

  rollToNode($event: TreeNode) {
    this.displayComponent.rollToNode($event)
  }
}
