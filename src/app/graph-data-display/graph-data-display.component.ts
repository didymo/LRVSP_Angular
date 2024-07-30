import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgForOf} from "@angular/common";
import * as d3 from 'd3';
import {forceCenter, Simulation, forceLink, ForceLink, forceManyBody, pointer, ForceCenter} from "d3";
import {GraphicalNode} from "../simulation-node";



@Component({
  selector: 'app-graph-data-display',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './graph-data-display.component.html',
  styleUrl: './graph-data-display.component.scss'
})
export class GraphDataDisplayComponent {
  protected primaryNodes: GraphicalNode[] = []
  protected get secondaryNodes(): GraphicalNode[] {
    return [...new Set(this.primaryNodes.flatMap((node) => node.linksTo).filter((node) => !this.primaryNodes.includes(node)))]
  }
  protected get nodes(): GraphicalNode[] {
    return [...new Set(this.primaryNodes.flatMap((node) => {
      return node.linksTo.concat([node])
    }))]
  }
  protected get links(): {source: GraphicalNode, target: GraphicalNode}[] {
    return this.primaryNodes.flatMap((node) => {
      return node.linksTo.map((linkTo) => {
        return {
          source: node,
          target: linkTo
        }
      })
    })
  }
  protected get primaryLinks(): {source: GraphicalNode, target: GraphicalNode}[] {
    return this.links.filter((link) => this.primaryNodes.includes(link.target))
  }
  protected get secondaryLinks(): {source: GraphicalNode, target: GraphicalNode}[] {
    return this.links.filter((link) => !this.primaryNodes.includes(link.target))
  }
  simulation!: Simulation<GraphicalNode, any>
  primaryLinkForce!: ForceLink<GraphicalNode, any>
  secondaryLinkForce!: ForceLink<GraphicalNode, any>

  protected nodeSize = 50;
  protected svgCenter = [0, 0];
  protected svgScale = 1
  protected get svgSize() {
    return [this.svgScale * 1000, this.svgScale *1000]
  }

  @ViewChild('canvas') protected svg!: ElementRef<SVGGraphicsElement>;
  protected mouseMovementInfo: {target: GraphicalNode | null; x: number, y: number} | null = null

  @Output() nodeSelected = new EventEmitter<GraphicalNode>


  initNodes(newNodes: GraphicalNode[]) {
    this.primaryNodes = newNodes;
    this.primaryLinkForce = forceLink(this.primaryLinks)
    this.primaryLinkForce.distance(600)
    this.secondaryLinkForce = forceLink(this.secondaryLinks)
    this.secondaryLinkForce.distance(300)
    this.simulation = d3.forceSimulation(this.nodes)
      .force('center', forceCenter())
      .force('primaryLinks', this.primaryLinkForce)
      .force('secondaryLinks', this.secondaryLinkForce)
      .force('charge', forceManyBody().strength(-300))
      .force('collide', d3.forceCollide(30))
      // .alphaDecay(0)
  }

  addNode(newNode: GraphicalNode) {
    if (!this.primaryNodes.includes(newNode)) {
      this.primaryNodes.push(newNode);
      this.simulation.nodes(this.nodes)
      this.primaryLinkForce.links(this.primaryLinks)
      this.secondaryLinkForce.links(this.secondaryLinks)
    }
    this.simulation.alpha(1)
    this.simulation.restart()
  }
  removeNode(removalNode: GraphicalNode) {
    if (this.primaryNodes.includes(removalNode)) {
      this.primaryNodes.splice(this.primaryNodes.indexOf(removalNode), 1)
      this.simulation.nodes(this.nodes)
      this.primaryLinkForce.links(this.primaryLinks)
      this.secondaryLinkForce.links(this.secondaryLinks)
    }
    this.simulation.alpha(1)
    this.simulation.restart()
  }

  linkEndOffset(link: {source: GraphicalNode, target: GraphicalNode}) {
    let dx = link.target.x - link.source.x;
    let dy = link.target.y - link.source.y;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    let ox = (dx/d) * this.nodeSize/2
    let oy = (dy/d) * this.nodeSize/2
    return [ox, oy]
  }

  zoom(event: WheelEvent) {
    event.preventDefault()
    this.svgScale *= Math.pow(2, event.deltaY * 0.01);
    console.log(this.svgScale)
  }

  ngAfterViewInit() {
    this.initNodes([])
  }

  canvasDown(event: MouseEvent) {
    if (!this.mouseMovementInfo) {
    let point = this.getPointFromEvent(event)
    this.mouseMovementInfo = {
      target: null,
      x: point.x,
      y: point.y
    }
    }
  }

  nodeDown(event: MouseEvent, node: GraphicalNode) {
    let point = this.getPointFromEvent(event)
    this.mouseMovementInfo = {
      target: node,
      x: 0,
      y: 0
    }
    node.fx = point.x - this.nodeSize/2
    node.fy = point.y - this.nodeSize/2
    this.nodeSelected.emit(node)
  }

  canvasUp(event: MouseEvent) {
    this.mouseMovementInfo = null
  }

  canvasDrag(event: MouseEvent) {
    event.preventDefault()
    if (!this.mouseMovementInfo) return

    this.simulation.alpha(0.1)
    this.simulation.restart()
    if (!this.mouseMovementInfo.target) {
      let pointerPosition = this.getPointFromEvent(event)
      this.svgCenter[0] -= (pointerPosition.x - this.mouseMovementInfo.x)
      this.svgCenter[1] -= (pointerPosition.y - this.mouseMovementInfo.y)
    } else {
      let pointerPosition = this.getPointFromEvent(event)
      this.mouseMovementInfo.target.fx = (pointerPosition.x - this.nodeSize/2)
      this.mouseMovementInfo.target.fy = (pointerPosition.y - this.nodeSize/2)
      this.mouseMovementInfo.target.fixed = true
    }
  }

  domPoint = new DOMPoint(0, 0)
  getPointFromEvent(event: MouseEvent) {
    this.domPoint.x = event.clientX
    this.domPoint.y = event.clientY
    let inverseMatrix = this.svg.nativeElement.getScreenCTM()!.inverse();
    return this.domPoint.matrixTransform(inverseMatrix)
  }

}
