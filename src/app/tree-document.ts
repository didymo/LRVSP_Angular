import {TreeNode} from "./tree-node";

export class TreeDocument {
  nodeId: string;
  nodeTitle: string;
  linksTo: Set<TreeDocument>;
  private treeNodes: Set<TreeNode> = new Set()

  constructor(nodeId: string, nodeTitle: string, linksTo?: Set<TreeDocument>) {
    this.nodeId = nodeId;
    this.nodeTitle = nodeTitle;
    this.linksTo = linksTo ?? new Set();
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
