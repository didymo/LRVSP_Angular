import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GraphicalNode} from "../simulation-node";
import {NgForOf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatOption, MatSelect} from "@angular/material/select";
import {TreeDocument} from "../tree-document";

@Component({
  selector: 'app-tree-data-selector',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    MatSelect,
    MatOption
  ],
  templateUrl: './tree-data-selector.component.html',
  styleUrl: './tree-data-selector.component.scss'
})
export class TreeDataSelectorComponent {
  @Input() options: TreeDocument[] = []
  @Output() selectedOption = new EventEmitter<TreeDocument>

  private _selectedValue: TreeDocument | null = null

  // Currently, this class is too simple to warrant any real level of bookkeeping (as shown here). However, at some
  // point this component will be responsible for letting the user select how they want the graph filtered as well, so
  // we need a little extra management for future proofing.
  get selectedValue(): TreeDocument | null {
    return this._selectedValue
  }

  set selectedValue(newVal: TreeDocument) {
    this._selectedValue = newVal
    this.selectedOption.emit(newVal)
  }
}
