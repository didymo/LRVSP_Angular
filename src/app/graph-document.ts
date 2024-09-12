import {TreeNode} from "./tree-node";

export class GraphDocument {
  nodeId: string;
  nodeTitle: string;
  tracked: boolean;
  linksTo: Set<GraphDocument>;
  stub: boolean
  private treeNodes: Set<TreeNode> = new Set()

  constructor(nodeId: string, nodeTitle: string, tracked?: boolean, linksTo?: Set<GraphDocument>, stub?: boolean) {
    this.nodeId = nodeId;
    this.nodeTitle = nodeTitle;
    this.tracked = tracked ?? false;
    this.linksTo = linksTo ?? new Set();
    this.stub = stub ?? false
  }

  linkNewNode(node: TreeNode) {
    this.treeNodes.add(node)
  }

  unlinkNode(node: TreeNode) {
    this.treeNodes.delete(node)
  }

  forEachTreeNode(f: (arg0: TreeNode) => undefined) {
    this.treeNodes.forEach(f)
  }
}
