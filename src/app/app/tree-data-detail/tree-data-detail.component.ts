import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TreeNode} from "../../tree-node";

@Component({
  selector: 'app-tree-data-detail',
  standalone: true,
  imports: [],
  templateUrl: './tree-data-detail.component.html',
  styleUrl: './tree-data-detail.component.scss'
})
export class TreeDataDetailComponent {
  @Input() node!: TreeNode | null
  @Output() roll = new EventEmitter<TreeNode>
}
