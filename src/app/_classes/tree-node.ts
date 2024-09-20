import {GraphDocument} from "./graph-document";

export class TreeNode {
  readonly graphDocument: GraphDocument;
  private _children: Set<TreeNode> = new Set();
  private _expanded: boolean = false;
  private _hover: boolean = false;
  hierarchy: d3.HierarchyNode<TreeNode> | undefined

  constructor(doc: GraphDocument) {
    this.graphDocument = doc;
    this.graphDocument.linkNewNode(this)
  }

  get children() {
    return this._children
  }

  get expanded() {
    return this._expanded
  }

  get hover() {
    return this._hover
  }

  set hover(val: boolean) {
    this.graphDocument.forEachTreeNode((node) => {
      node._hover = val;
    })
  }

  expand() {
    if (!this._expanded) {
      this.graphDocument.linksTo.forEach((doc) => {
        this._children.add(new TreeNode(doc))
      })
      this._expanded = true;
    }
  }

  contract() {
    if (this._expanded) {
      this._children.forEach((child) => {
        child.graphDocument.unlinkNode(child)
      })
      this._children.clear()
      this._expanded = false
    }
  }

  toggleExpanded() {
    this.expanded ? this.contract() : this.expand();
  }

  flatten(): Set<TreeNode> {
    let returnSet = new Set<TreeNode>().add(this)

    this._children.forEach((child) => {
      returnSet = new Set([...returnSet, ...child.flatten()])
    })

    return returnSet
  }
}
