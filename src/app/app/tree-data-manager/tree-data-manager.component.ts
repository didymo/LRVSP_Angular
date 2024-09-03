import {Component, ViewChild} from '@angular/core';
import {GraphDataService, Operation} from "../../graph-data.service";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {TreeDataDetailComponent} from "../tree-data-detail/tree-data-detail.component";
import {TreeDataDisplayComponent} from "../tree-data-display/tree-data-display.component";
import {GraphDocument} from "../../graph-document";
import {TreeNode} from "../../tree-node";
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
  nodes: Map<string, GraphDocument> = new Map
  detailNode: TreeNode | null = null

  @ViewChild(TreeDataDisplayComponent) displayComponent!: TreeDataDisplayComponent;
  @ViewChild('detailSidebar') detailSidebar!: MatSidenav;

  constructor(private graphDataService: GraphDataService) {

  }

  ngOnInit() {
    this.graphDataService.getDocs().subscribe((value) => {
      switch (value.op) {
        case Operation.CREATE:
          if (this.nodes.has(value.doc.id)) {
            let existingDoc = this.nodes.get(value.doc.id)!
            existingDoc.nodeTitle = value.doc.title
            existingDoc.tracked = value.doc.tracked
            existingDoc.stub = false
          } else {
            this.nodes.set(value.doc.id, new GraphDocument(
              value.doc.id,
              value.doc.title,
              value.doc.tracked
            ))
          }
          this.graphDataService.getLinks(value.doc.id).subscribe((value) => {
            let link = value.link
            switch (value.op) {
              case Operation.CREATE:
                let fromDoc = this.nodes.get(link.fromDoc) ?? new GraphDocument(link.fromDoc, '', false, new Set(), true)
                this.nodes.set(link.fromDoc, fromDoc)
                let toDoc = this.nodes.get(link.toDoc) ?? new GraphDocument(link.toDoc, '', false, new Set(), true)
                this.nodes.set(link.toDoc, toDoc)
                fromDoc.linksTo.add(toDoc)
                this.displayComponent.informRebuildRequired(fromDoc)
                break
              case Operation.DELETE:
                if (this.nodes.has(link.fromDoc) && this.nodes.has(link.toDoc)) {
                  this.nodes.get(link.fromDoc)!.linksTo.delete(this.nodes.get(link.toDoc)!)
                  this.displayComponent.informRebuildRequired(this.nodes.get(link.fromDoc)!)
                }
            }
          })
          break
        case Operation.UPDATE:
          if (this.nodes.has(value.doc.id)) {
            let existingDoc = this.nodes.get(value.doc.id)!
            existingDoc.nodeTitle = value.doc.title
            existingDoc.tracked = value.doc.tracked
            existingDoc.stub = false
          } else {
            this.nodes.set(value.doc.id, new GraphDocument(
              value.doc.id,
              value.doc.title,
              value.doc.tracked
            ))
          }
          break
        case Operation.DELETE:
          this.nodes.delete(value.doc.id)
      }
    })
  }

  // Fired when the user makes a selection in GraphDataSelector
  dropDownSelect(doc: GraphDocument) {
    let newTreeNode =  new TreeNode(doc)
    this.displayComponent.rootNode = newTreeNode
    console.log(newTreeNode)
  }

  nodeSelected(node: TreeNode) {
    this.detailNode = node
    this.detailSidebar?.open()
  }

  rollToNode($event: TreeNode) {
    this.displayComponent.rollToNode($event)
  }
}
