import {Component, Input, ViewChild} from '@angular/core';
import {GraphDataService} from "../../_services/graph-data.service";
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {TreeDataDetailComponent} from "../tree-data-detail/tree-data-detail.component";
import {TreeDataDisplayComponent} from "../tree-data-display/tree-data-display.component";
import {GraphDocument} from "../../_classes/graph-document";
import {TreeNode} from "../../_classes/tree-node";
import {TreeDataSelectorComponent} from "../tree-data-selector/tree-data-selector.component";
import {Operation} from "../../_enums/opperation";
import {DrupalDocDetails} from "../../_interfaces/drupal-doc-details";
import {Subscription} from "rxjs";
import {DefaultableMap} from "../../_classes/defaultable-map";

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
  @Input() preselectId: string | undefined;
  nodes: DefaultableMap<string, GraphDocument> = new DefaultableMap()
  detailNode: TreeNode | undefined
  detailNodeDetails: DrupalDocDetails | null = null
  detailSubscriber: Subscription | null = null

  @ViewChild(TreeDataSelectorComponent) selectorComponent!: TreeDataSelectorComponent;
  @ViewChild(TreeDataDisplayComponent) displayComponent!: TreeDataDisplayComponent;
  @ViewChild('detailSidebar') detailSidebar!: MatSidenav;

  constructor(private graphDataService: GraphDataService) {
  }

  ngAfterViewInit() {
    this.graphDataService.getDocs().subscribe((value) => {
      switch (value.operation) {
        case Operation.CREATE:
          if (this.nodes.has(value.data.id)) {
            let existingDoc = this.nodes.get(value.data.id)!
            existingDoc.nodeTitle = value.data.title
            existingDoc.tracked = value.data.tracked
            existingDoc.stub = false
          } else {
            this.nodes.set(value.data.id, new GraphDocument(
              value.data.id,
              value.data.title,
              value.data.tracked
            ))
          }
          if (this.preselectId && this.preselectId == value.data.id) {
            this.selectorComponent.setSelectedValue(this.nodes.get(this.preselectId)!)
            this.dropDownSelect(this.nodes.get(this.preselectId)!)
          }
          this.graphDataService.getLinks(value.data.id).subscribe((value) => {
            let link = value.data
            switch (value.operation) {
              case Operation.CREATE:
                if (value.data.toDoc !== value.data.fromDoc) {
                  let fromDoc = this.nodes.getOrSetDefaultDefer(link.fromDoc, () => new GraphDocument(link.fromDoc, '', false, new Set(), true))
                  let toDoc = this.nodes.getOrSetDefaultDefer(link.toDoc, () => new GraphDocument(link.toDoc, '', false, new Set(), true))
                  fromDoc.linksTo.add(toDoc)
                  this.displayComponent.informRebuildRequired(fromDoc)
                }
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
          if (this.nodes.has(value.data.id)) {
            let existingDoc = this.nodes.get(value.data.id)!
            existingDoc.nodeTitle = value.data.title
            existingDoc.tracked = value.data.tracked
            existingDoc.stub = false
          } else {
            this.nodes.set(value.data.id, new GraphDocument(
              value.data.id,
              value.data.title,
              value.data.tracked
            ))
          }
          break
        case Operation.DELETE:
          this.nodes.delete(value.data.id)
      }
    })
  }

  // Fired when the user makes a selection in GraphDataSelector
  dropDownSelect(doc: GraphDocument) {
    for (let graphDoc of this.nodes.values()) {
      graphDoc.clearTreeNodes()
    }
    let newTreeNode =  new TreeNode(doc)
    this.displayComponent.rootNode = newTreeNode
  }

  nodeSelected(node: TreeNode) {
    this.detailSubscriber?.unsubscribe()
    this.detailSubscriber = this.graphDataService.getDocDetails(node.graphDocument.nodeId).subscribe(
      (detail) => {
        this.detailNodeDetails = detail
      }
    )
    this.detailNode = node
    this.detailSidebar?.open()
  }

  rollToNode($event: TreeNode) {
    this.displayComponent.rollToNode($event)
  }
}
