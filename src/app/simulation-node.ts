export interface GraphicalNode {
  nodeId: string;
  nodeTitle: string;
  linksTo: GraphicalNode[];
  x: number;
  y: number;
  fx: number | undefined | null
  fy: number | undefined | null
  fixed: boolean
}
