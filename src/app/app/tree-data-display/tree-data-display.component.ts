import {Component, ElementRef, EventEmitter, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import * as d3 from 'd3';
import {GraphicalNode} from "../../simulation-node";
import {TreeNode} from "../../tree-node";
import {hierarchy, HierarchyNode, some} from "d3";
import {GraphDocument} from "../../graph-document";
import {MatTooltip} from "@angular/material/tooltip";


// The GraphDataDisplay component is designed to provide a simple way of displaying document nodes
@Component({
  selector: 'app-tree-data-display',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    MatTooltip
  ],
  templateUrl: './tree-data-display.component.html',
  styleUrl: './tree-data-display.component.scss'
})
export class TreeDataDisplayComponent {
  protected _rootNode: TreeNode | undefined;
  protected hierarchy: d3.HierarchyNode<TreeNode> | undefined
  private treeLayout: d3.TreeLayout<TreeNode> = d3.tree()

  protected angleOffset: number = 0;

  @ViewChildren('nodes') children?: QueryList<ElementRef<SVGGraphicsElement>>;

  //Details controlling the display of nodes in the .html file for GraphDataDisplay
  protected svgCenter = [0, 0];
  protected svgScale = 1
  protected svgRingRadius = 200;
  protected svgPillRadius = 4;
  protected svgPillLength = 60;
  protected get svgSize() {
    return [this.svgScale * 1000, this.svgScale *1000]
  }
  protected linkGenerator = d3.linkRadial()

  @Output() nodeSelected = new EventEmitter<TreeNode>

  @ViewChild('canvas') protected svg!: ElementRef<SVGGraphicsElement>;
  protected mouseMovementInfo: {target: TreeNode | null; x: number, y: number} | null = null

  set rootNode(newRoot: TreeNode) {
    this._rootNode = newRoot;
    this._rootNode.expand()
    this.buildTree();
  }

  zoom(event: WheelEvent) {
    event.preventDefault()
    // Using the naiive this.svgScale *= event.deltaY or this.svgScale += event.deltaY would result in negative scale instead of reduced scale.
    // The base of math.pow() can be adjusted to tune scale stepping
    this.svgScale *= Math.pow(1.1, event.deltaY * 0.01);
    console.log(this.svgScale)
  }

  // Fires whenever a mouseclick happens on the app that wasn't on a node - basically, checks for the start of an attempt to drag the app around.
  canvasDown(event: MouseEvent) {
    if (!this.mouseMovementInfo) {
      // Responsible for converting global coords to local coords.
      // While MouseEvent's do provide layerX/layerY in all modern browsers, which should in theory be local coords, the
      // variable is non-standard, not on standards track, and just what 'layer' means is inconsistent across browsers.
      // Basically, more hassle than it's worth.
      let point = this.getPointFromEvent(event)
      this.mouseMovementInfo = {
        target: null,         // The same structure is used for app dragging and node dragging. Target being null indicated that the app was dragged.
        x: point.x,
        y: point.y
      }
    }
  }

  canvasUp(event: MouseEvent) {
    // We're not dragging anymore, so unset the mouseMovementInfo
    this.mouseMovementInfo = null
  }

  canvasDrag(event: MouseEvent) {
    event.preventDefault()
    if (!this.mouseMovementInfo) return

    let pointerPosition = this.getPointFromEvent(event)
    this.svgCenter[0] -= (pointerPosition.x - this.mouseMovementInfo.x)
    this.svgCenter[1] -= (pointerPosition.y - this.mouseMovementInfo.y)
  }

  domPoint = new DOMPoint(0, 0)
  getPointFromEvent(event: MouseEvent) {
    this.domPoint.x = event.clientX
    this.domPoint.y = event.clientY
    // getScreenCTM gives us a transformation matrix from svg viewport coords to screen coords. Inverting it lets us go the other way.
    let inverseMatrix = this.svg.nativeElement.getScreenCTM()!.inverse();
    return this.domPoint.matrixTransform(inverseMatrix)
  }

  nodeClick(node: TreeNode) {
    node.toggleExpanded()
    this.buildTree()
    this.rollToNode(node)
  }

  pillClicked(event: MouseEvent, node: TreeNode) {
    this.nodeSelected.emit(node)
    this.rollToNode(node)
  }

  getNodeRotation(node: TreeNode): number {
    let retval;
    // The center node should always be horizontal
    if (node.hierarchy?.y == 0) {
      retval = 0;
    }
    else {
      retval = node.hierarchy?.x! * (180 / Math.PI) + this.angleOffset
    }

    // Keep the return in range (0, 360)
    while (retval < 0) {
      retval += 360
    }
    while (retval > 360) {
      retval -= 360
    }
    return retval
  }

  rollToNode($event: TreeNode) {
    this.angleOffset = -this.getNodeRotation($event) + this.angleOffset
  }

  nodeHover($event: MouseEvent, node: TreeNode) {
    node.hover = true
  }

  nodeLeave($event: MouseEvent, node: TreeNode) {
    node.hover = false
  }

  // D3 trees and hierarchies can't be modified after creation, so we need to tear down our existing hierarchies and rebuild them when a node is expanded.
  // In a normal situation, we wouldn't need to do this, because the data would be static.
  // Out data is generated from a graph, so attempting to present the entire tree would cause an infinite cascade.
  private buildTree() {
    this.hierarchy = d3.hierarchy(this._rootNode!)
    // Link each TreeNode to it's d3 hierarchy - TreeNodes are used by us to keep track of the placement of documents in the tree, hierarchies are used by D3 for the same purpose.
    // The way we do things is technically incompatible with D3, so we do this to sort of shim the two systems together.
    this.hierarchy.descendants().forEach((descendant) => {
      descendant.data.hierarchy = descendant;
    })

    // Tell D3 how far apart we want our nodes to be
    this.treeLayout.separation((a, b) => {
      return (a.parent == b.parent ? 1 : 2) / a.depth;
    })

    // Estimate how large the inner ring needs to be to comfortably fit all the nodes.
    this.svgRingRadius = 200
    // The following two metrics are technically not comparable - one is a perimeter, the other a circumference, but we
    // overestimate node spacing, and by the time that it matters, the error starts to become small enough that it
    // doesn't matter
    let nodesRequiredSpacing = this._rootNode!.children!.size *  (this.svgPillRadius * 3)
    let nodesAvailableSpacing = 2 * Math.PI * (this.svgRingRadius - this.svgPillLength)

    if (nodesRequiredSpacing > nodesAvailableSpacing) {
      // Scale up the radius so that we have enough room if we need id
      this.svgRingRadius = this.svgRingRadius * (nodesRequiredSpacing / nodesAvailableSpacing)
      // Tell D3 the space it has to place the tree within. We're doing a radial tree, so we go from 0 to 2PI in width
      this.treeLayout.size([Math.PI * 2, this.svgRingRadius * this.hierarchy.height])
    } else if (this._rootNode?.hierarchy?.height == 1) {
      // We haven't used all our available room, so we can shrink the range that D3 operates over. We should only do this
      // if we haven't expanded beyond one layer, because that becomes messy to properly calculate, and this is just a quick estimate
      // to ensure the first layer looks good.
      this.treeLayout.size([nodesRequiredSpacing / nodesAvailableSpacing * Math.PI * 2, this.svgRingRadius * this.hierarchy.height])
    } else {
      this.treeLayout.size([Math.PI * 2, this.svgRingRadius * this.hierarchy.height])
    }
    // Finally, tell the layout which data it's supposed to use.
    this.treeLayout(this.hierarchy)
  }

  polToCart(radius: number, angle_degrees: number): {x: () => number, y: () => number } {
    return {
      x: () => radius * Math.cos(angle_degrees * Math.PI / 180),
      y: () => radius * Math.sin(angle_degrees * Math.PI / 180)
    }
  }

  generateLinkPath(source: TreeNode, target: TreeNode): string | null {
    let startCoord = this.polToCart(source.hierarchy!.y! + this.svgPillRadius, this.getNodeRotation(source))
    let ctrlStart = this.polToCart(source.hierarchy!.y! + this.svgPillRadius + this.svgRingRadius / 4, this.getNodeRotation(source))
    let ctrlEnd = this.polToCart(target.hierarchy!.y! - this.svgPillLength - this.svgPillRadius - this.svgRingRadius / 4, this.getNodeRotation(target))
    let endCoord = this.polToCart(target.hierarchy!.y! - this.svgPillLength - this.svgPillRadius, this.getNodeRotation(target))
    return `M ${startCoord.x()} ${startCoord.y()} C ${ctrlStart.x()} ${ctrlStart.y()} ${ctrlEnd.x()} ${ctrlEnd.y()} ${endCoord.x()} ${endCoord.y()}`
    // return `M ${startCoord.x()} ${startCoord.y()} L ${ctrlStart.x()} ${ctrlStart.y()} ${ctrlEnd.x()} ${ctrlEnd.y()} ${endCoord.x()} ${endCoord.y()}`
  }



  informRebuildRequired(graphDoc: GraphDocument) {
    // We need to rebuild the tree nodes associated with the given graph node - or at least resolve any changes made
    // -- Graph nodes and tree nodes exist in parallel hierarchies. We need to check that the hierarchy is still consistent.
    //    GN <------> TN[]
    //     |           |
    //     |           |
    //    GNC[] <--?--> TNC[][]
    // 1. Walk the path GN -> TN -> TNC -> GNC, and check that GN does have the found GNC as a child. If it doesn't,
    //    then the link between GN and GNC must have been removed, so we should do the same for the link between TN and
    //    TNC
    // 2. We've removed any extra tree nodes, so any discrepancies between the length of a member of TN's children and
    //    the length of GN's children must be a missing tree node of some sort.
    // 3. Walk the paths GN -> TN -> TNC[] and GN -> GNC. Make sure that at least one member of TNC[] has a graph node
    //    that matches GNC. If not, create a Tree Node associated with GNC, and wire it into the correct parent tree
    //    node.
    // 4. If the graph is currently being displayed (i.e. this._rootNode is set) then rebuild the d3 hierarchy as well.

    graphDoc.forEachTreeNode((treeNode) => {
      for (let childTreeNode of treeNode.children) {
        let childGraphDoc = childTreeNode.graphDocument;
        if (!graphDoc.linksTo.has(childGraphDoc)) {
          treeNode.children.delete(childTreeNode)
        }
      }
      if (treeNode.children.size != graphDoc.linksTo.size) {
        for (let childGraphDoc of graphDoc.linksTo) {
          if (!Array.from(treeNode.children).some((childTreeNode) => childTreeNode.graphDocument === childGraphDoc)) {
            let newTreeNodeChild = new TreeNode(childGraphDoc);
            treeNode.children.add(newTreeNodeChild)
          }
        }
      }
    })
    if (this._rootNode) {
      this.buildTree()
    }
  }
}
