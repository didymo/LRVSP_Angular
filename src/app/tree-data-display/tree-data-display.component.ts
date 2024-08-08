import {Component, ElementRef, EventEmitter, Output, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import * as d3 from 'd3';
import {GraphicalNode} from "../simulation-node";
import {TreeNode} from "../tree-node";
import {hierarchy, HierarchyNode} from "d3";


// The GraphDataDisplay component is designed to provide a simple way of displaying document nodes
@Component({
  selector: 'app-tree-data-display',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './tree-data-display.component.html',
  styleUrl: './tree-data-display.component.scss'
})
export class TreeDataDisplayComponent {
  protected _rootNode: TreeNode | undefined;
  protected hierarchy: d3.HierarchyNode<TreeNode> | undefined
  private treeLayout: d3.TreeLayout<TreeNode> = d3.tree()

  private angleOffset = 0;

  @ViewChildren('nodes') children?: QueryList<ElementRef<SVGGraphicsElement>>;

  //Details controlling the display of nodes in the .html file for GraphDataDisplay
  protected nodeSize = 50;
  protected svgCenter = [0, 0];
  protected svgScale = 1
  protected get svgSize() {
    return [this.svgScale * 1000, this.svgScale *1000]
  }

  @Output() nodeSelected = new EventEmitter<TreeNode>

  @ViewChild('canvas') protected svg!: ElementRef<SVGGraphicsElement>;
  protected mouseMovementInfo: {target: TreeNode | null; x: number, y: number} | null = null

  set rootNode(newRoot: TreeNode) {
    this._rootNode = newRoot;
    this._rootNode.expand()
    this.hierarchy = d3.hierarchy(this._rootNode)
    this.hierarchy.descendants().forEach((descendant) => {
      descendant.data.hierarchy = descendant;
    })
    this.treeLayout.size([Math.PI * 2, 200 * this.hierarchy.height])
    this.treeLayout.separation((a, b) => {
      return (a.parent == b.parent ? 1 : 2) / a.depth;
    })
    this.treeLayout(this.hierarchy)
  }

  zoom(event: WheelEvent) {
    event.preventDefault()
    // Using the naiive this.svgScale *= event.deltaY or this.svgScale += event.deltaY would result in negative scale instead of reduced scale.
    // The base of math.pow() can be adjusted to tune scale stepping
    this.svgScale *= Math.pow(1.1, event.deltaY * 0.01);
    console.log(this.svgScale)
  }

  // Fires whenever a mouseclick happens on the canvas that wasn't on a node - basically, checks for the start of an attempt to drag the canvas around.
  canvasDown(event: MouseEvent) {
    if (!this.mouseMovementInfo) {
      // Responsible for converting global coords to local coords.
      // While MouseEvent's do provide layerX/layerY in all modern browsers, which should in theory be local coords, the
      // variable is non-standard, not on standards track, and just what 'layer' means is inconsistent across browsers.
      // Basically, more hassle than it's worth.
      let point = this.getPointFromEvent(event)
      this.mouseMovementInfo = {
        target: null,         // The same structure is used for canvas dragging and node dragging. Target being null indicated that the canvas was dragged.
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

  protected readonly Math = Math;

  nodeClick(event: MouseEvent, node: TreeNode) {
    node.toggleExpanded()
    this.hierarchy = d3.hierarchy(this._rootNode!)
    this.hierarchy.descendants().forEach((descendant) => {
      descendant.data.hierarchy = descendant;
    })
    this.treeLayout.size([Math.PI * 2, 200 * this.hierarchy.height])
    this.treeLayout.separation((a, b) => {
      return (a.parent == b.parent ? 1 : 2) / a.depth;
    })
    this.treeLayout(this.hierarchy)
  }

  pillClicked(event: MouseEvent, node: TreeNode) {
    this.nodeSelected.emit(node)
  }

  coordsFromHierarchy(hierarchy: d3.HierarchyNode<TreeNode>): {x: () => number, y: () => number} {
    return this.polToCar(hierarchy.y!, hierarchy.x! + this.angleOffset)
  }

  polToCar(radius: number, angle: number) : {x: () => number, y: () => number} {
    return {
      x: () => radius * Math.cos(angle),
      y: () => radius * Math.sin(angle),
    }
  }

  rollToNode($event: TreeNode) {
    this.angleOffset = -$event.hierarchy!.x!
  }

  nodeHover($event: MouseEvent, node: TreeNode) {
    node.hover = true
  }

  nodeLeave($event: MouseEvent, node: TreeNode) {
    node.hover = false
  }
}
