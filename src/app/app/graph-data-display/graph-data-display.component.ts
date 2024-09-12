import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {NgForOf} from "@angular/common";
import * as d3 from 'd3';
import {forceCenter, Simulation, forceLink, ForceLink, forceManyBody} from "d3";
import {GraphicalNode} from "../../simulation-node";


// The GraphDataDisplay component is designed to provide a simple way of displaying document nodes
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
  // Primary nodes are the nodes explicitly chosen to be displayed
  protected primaryNodes: GraphicalNode[] = []

  // Secondary nodes are a generated list of nodes that are referenced by primary nodes. If a primary node is referenced
  //   by another primary node, it is not considered a secondary node
  protected get secondaryNodes(): GraphicalNode[] {
    // 1. For Each primary node:
    //    1. Extract the list of nodes that it links to/references
    //    2. Flatten the resulting list of lists
    // 2. Filter out any nodes that are already primary nodes - being a primary node takes priority
    // 3. Convert the list to a Set to remove duplicates
    // 4. Convert Set back to Array using the Spread operator ([...Set])
    return [...new Set(this.primaryNodes.flatMap((node) => node.linksTo).filter((node) => !this.primaryNodes.includes(node)))]
  }

  // All nodes, both primary and secondary
  protected get nodes(): GraphicalNode[] {
    // 1. For Each primary node:
    //    1. Extract the list of nodes that it links to/references
    //    2. Concat the parent node to the list of referenced nodes, so that the parent node is definitely in the resulting array
    //    3. Flatten the resulting list of lists
    // 2. Convert the list to a Set to remove duplicates
    // 3. Convert Set back to Array using the Spread operator ([...Set])
    // It would be possible to simply return primaryNodes.concat(secondaryNodes), but this would essentially involve
    //   filtering primary nodes out, before adding them back in - which is somewhat reductive.
    return [...new Set(this.primaryNodes.flatMap((node) => {
      return node.linksTo.concat([node])
    }))]
  }

  //We only care about displaying links from primary nodes, so we generate a link object for each element in the primary
  // nodes linksTo array which is used by d3-force later
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

  // Links between two primary nodes ald links from a primary node to a secondary node are handled slightly differently
  // in layout. As such, we need a way to differentiate them. Because each link should have a primary node as its
  // source, we can just check if the target node is primary or secondary.
  protected get primaryLinks(): {source: GraphicalNode, target: GraphicalNode}[] {
    return this.links.filter((link) => this.primaryNodes.includes(link.target))
  }
  protected get secondaryLinks(): {source: GraphicalNode, target: GraphicalNode}[] {
    return this.links.filter((link) => !this.primaryNodes.includes(link.target))
  }

  simulation!: Simulation<GraphicalNode, any>
  primaryLinkForce!: ForceLink<GraphicalNode, any>
  secondaryLinkForce!: ForceLink<GraphicalNode, any>

  //Details controlling the display of nodes in the .html file for GraphDataDisplay
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

    // ForceLinks attempt to keep nodes that are explicitly linked a specific distance away from each other.
    // In an attempt to create some kind of clustering, primary nodes are twice as far apart as their associated
    // secondary nodes.
    this.primaryLinkForce = forceLink(this.primaryLinks)
    this.primaryLinkForce.distance(600)
    this.secondaryLinkForce = forceLink(this.secondaryLinks)
    this.secondaryLinkForce.distance(300)

    this.simulation = d3.forceSimulation(this.nodes)                    // Create a simulation with the nodes that we want simulated
      .force('center', forceCenter())                             // A centering force tries to keep the center of mass at 0, 0. This starts to exhibit strange behaviour with 1. fixed nodes and 2. small amounts of nodes. Should probably be removed or severely weakened
      .force('primaryLinks', this.primaryLinkForce)               // LinkForce as described above
      .force('secondaryLinks', this.secondaryLinkForce)
      .force('charge', forceManyBody().strength(-300))   // Simulated repulsion force between nodes - tries to evenly distribute nodes throughout the space. Negative values are repulsion, positive are attraction.
      .force('collide', d3.forceCollide(30))               // Collision force. Prevents nodes from overlapping. forceManyBody could be used for this if there are few nodes, but forceCollide is more aggressive at preventing overlap. It can still be overpowered if other forces are at play
      // Alpha controls the 'heat' of the simulation. When the heat reaches a certain lower threshold, the
      // simulation stops. D3 uses this instead of the more expensive 'local minima by gradient descent' alternative.
      // While this may be less 'accurate' (for a given value of accurate), it does prevent runaway simulations where
      // there is no local minima.
      // Setting alphaDecay to 0 prevents the simulation from losing heat, essentially disabling the mechanism.
      // Useful for seeing how the forces play out over extended periods of time, not useful for much else.
      //.alphaDecay(0)


  }

  // Adds a node to the graph and to the simulation. This would be better as an @Input, but due to the current design of
  // GraphDataService, this would introduce a race condition on startup.
  //TODO: Convert to @Input logic once GraphDataService is rewritten
  addNode(newNode: GraphicalNode) {
    //Primary nodes should only exist once
    if (!this.primaryNodes.includes(newNode)) {
      this.primaryNodes.push(newNode);
      // We need to inform the simulation about the new node that has been added.
      this.simulation.nodes(this.nodes)
      //Similarly, we need to inform the link forces about any new links that may exist.
      this.primaryLinkForce.links(this.primaryLinks)
      this.secondaryLinkForce.links(this.secondaryLinks)
    }
    //'reheat' the simulation - Adding a new node affects the simulation enough that node positions might
    // significantly change.
    this.simulation.alpha(1)

    // Contrary to intuition, simulation.restart() does not reset the simulation, merely resumes it. This is needed,
    // because if the simulation has cooled to the point of stopping, simply reheating it won't start it again.
    this.simulation.restart()
  }

  //Similar logic to addNode, but mostly just inverted.
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

  // Calculates the offset from a nodes center that a link's endpoint should be drawn
  linkEndOffset(link: {source: GraphicalNode, target: GraphicalNode}) {
    let dx = link.target.x - link.source.x;
    let dy = link.target.y - link.source.y;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))        // Distance between nodes
    let ox = (dx/d) * this.nodeSize/2                                  // convert dx to unit vector component, then scale to required radius
    let oy = (dy/d) * this.nodeSize/2                                  // Same as above, but with dt
    return [ox, oy]
  }

  zoom(event: WheelEvent) {
    event.preventDefault()
    // Using the naiive this.svgScale *= event.deltaY or this.svgScale += event.deltaY would result in negative scale instead of reduced scale.
    // The base of math.pow() can be adjusted to tune scale stepping
    this.svgScale *= Math.pow(1.1, event.deltaY * 0.01);
    console.log(this.svgScale)
  }

  ngAfterViewInit() {
    this.initNodes([])
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

  // Fires whenever a node is clicked. Assumes that this is the start of an attempt to drag the node.
  nodeDown(event: MouseEvent, node: GraphicalNode) {
    let point = this.getPointFromEvent(event)
    this.mouseMovementInfo = {
      target: node,
      x: 0,                 // When we're dragging a node around, historical data about the nodes position is ignored, so we just set it to 0.
      y: 0
    }

    // D3-force allows us to fix nodes in place by setting the node.fx/fy properties. Only setting one will allow the node
    // to move along a horizontal or vertical line.
    // The offset of nodeSize/2 is because all svg elements are anchored by the top-left corner, and we want the node centered on our mouse.
    node.fx = point.x - this.nodeSize/2
    node.fy = point.y - this.nodeSize/2

    // Tell the dataManager that we selected a node.
    this.nodeSelected.emit(node)
  }

  canvasUp(event: MouseEvent) {
    // We're not dragging anymore, so unset the mouseMovementInfo
    this.mouseMovementInfo = null
  }

  canvasDrag(event: MouseEvent) {
    event.preventDefault()
    if (!this.mouseMovementInfo) return

    // Reheat the simulation just enough to run while we're dragging either the app or the node.
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
    // getScreenCTM gives us a transformation matrix from svg viewport coords to screen coords. Inverting it lets us go the other way.
    let inverseMatrix = this.svg.nativeElement.getScreenCTM()!.inverse();
    return this.domPoint.matrixTransform(inverseMatrix)
  }

}
