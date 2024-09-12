import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GraphicalNode} from "../../simulation-node";
import {AsyncPipe, KeyValuePipe, NgForOf} from "@angular/common";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatOption, MatSelect} from "@angular/material/select";
import {GraphDocument} from "../../graph-document";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {MatInput} from "@angular/material/input";
import {map, Observable, startWith, tap} from "rxjs";

@Component({
  selector: 'app-tree-data-selector',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    MatSelect,
    MatOption,
    KeyValuePipe,
    MatAutocomplete,
    MatInput,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatFormField,
    AsyncPipe
  ],
  templateUrl: './tree-data-selector.component.html',
  styleUrl: './tree-data-selector.component.scss'
})
export class TreeDataSelectorComponent {
  formControl = new FormControl<string | GraphDocument | null>(null)
  @Input() options!: Map<string, GraphDocument>
  @Output() selectedOption = new EventEmitter<GraphDocument>

  private filterVal!: string | null;

  private _selectedValue: GraphDocument | null = null

  constructor() {
    this.formControl.valueChanges.subscribe((val) => {
      if (val instanceof GraphDocument) {
        this.selectedValue = val
      } else {
        this.filterVal = val;
      }
    })
  }

  // Currently, this class is too simple to warrant any real level of bookkeeping (as shown here). However, at some
  // point this component will be responsible for letting the user select how they want the graph filtered as well, so
  // we need a little extra management for future proofing.
  get selectedValue(): GraphDocument | null {
    return this._selectedValue
  }

  set selectedValue(newVal: GraphDocument) {
    this._selectedValue = newVal
    this.selectedOption.emit(newVal)
  }

  displayFn(graphDoc: GraphDocument) {
    return graphDoc.nodeTitle;
  }

  protected filteredOptions(): GraphDocument[] {
    if (! this.filterVal) {
      return Array.from(this.options.values())
    } else {
      const filterValue = this.filterVal.toLowerCase();
      return Array.from(this.options.values()).filter(
        (option) => {
          console.log(option)
          return option.nodeTitle.toLowerCase().includes(filterValue)
        }
      );
    }
  }
}
