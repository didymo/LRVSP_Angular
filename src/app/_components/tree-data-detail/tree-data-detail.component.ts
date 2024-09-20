import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TreeNode} from "../../_classes/tree-node";
import {MatAnchor, MatButton} from "@angular/material/button";
import {DrupalDocDetails} from "../../_interfaces/drupal-doc-details";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-tree-data-detail',
  standalone: true,
  imports: [
    MatButton,
    MatAnchor
  ],
  templateUrl: './tree-data-detail.component.html',
  styleUrl: './tree-data-detail.component.scss'
})
export class TreeDataDetailComponent {
  @Input() node: TreeNode | undefined
  @Input() details: DrupalDocDetails | null = null
  @Output() expandSelected = new EventEmitter<TreeNode>
  protected readonly environment = environment;
}
