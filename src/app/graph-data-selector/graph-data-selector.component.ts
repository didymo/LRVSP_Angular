import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GraphicalNode} from "../simulation-node";
import {NgForOf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-graph-data-selector',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule
  ],
  templateUrl: './graph-data-selector.component.html',
  styleUrl: './graph-data-selector.component.scss'
})
export class GraphDataSelectorComponent {
  @Input() options: GraphicalNode[] = []
  @Output() selectedOption = new EventEmitter<GraphicalNode>

  _selectedValue: GraphicalNode | null = null

  get selectedValue(): GraphicalNode | null {
    return this._selectedValue
  }

  set selectedValue(newVal: GraphicalNode) {
    this._selectedValue = newVal
    this.selectedOption.emit(newVal)
  }
}
