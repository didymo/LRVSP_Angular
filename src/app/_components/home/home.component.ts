import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import { trigger, transition, style, animate } from '@angular/animations';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatFormField, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {GraphDataService} from "../../_services/graph-data.service";
import {DrupalDoc} from "../../_interfaces/drupal-doc";
import {Operation} from "../../_enums/opperation";
import {DefaultableMap} from "../../_classes/defaultable-map";
import {MatButton, MatIconButton} from "@angular/material/button";
import {routes} from "../../app.routes";
import {AuthService} from "../../_services/auth.service";
import {NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    RouterLink,
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatInput,
    MatOption,
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    MatPrefix,
    MatSuffix,
    NgIf,
    MatIcon
  ],
  styleUrls: ['./home.component.scss'],

  animations: [
  trigger('routeAnimation', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-in', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('300ms ease-out', style({ opacity: 0 }))
    ])
  ])
]
})
export class HomeComponent {

  formControl = new FormControl<string | DrupalDoc | null>(null)

  private filterVal!: string | null
  protected _selectedValue: DrupalDoc | undefined

  options = new DefaultableMap<string, DrupalDoc>()

  constructor(private graphData: GraphDataService, protected router: Router, protected auth: AuthService) {
    this.formControl.valueChanges.subscribe((val) => {
      if (typeof val === 'string' || val === null) {
        this.filterVal = val;
      } else {
        this._selectedValue = val
      }
    })
    graphData.getDocs().subscribe((doc) => {
      switch (doc.operation) {
        case Operation.CREATE:
        case Operation.UPDATE:
          this.options.set(doc.data.id, doc.data)
          break;
        case Operation.DELETE:
      }
    })
  }

  protected filteredOptions(): DrupalDoc[] {
    if (! this.filterVal) {
      return Array.from(this.options.values())
    } else {
      const filterValue = this.filterVal.toLowerCase();
      return Array.from(this.options.values()).filter(
        (option) => {
          return option.title.toLowerCase().includes(filterValue)
        }
      );
    }
  }

  displayFn(graphDoc: DrupalDoc) {
    return graphDoc.title;
  }

  protected readonly routes = routes;

  navigateApp() {
    this.router.navigate(['app/', {preselectId: this._selectedValue?.id}])
  }
}
