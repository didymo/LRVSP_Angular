import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons/faSearch";
import {faCog} from "@fortawesome/free-solid-svg-icons/faCog";
import { trigger, transition, style, animate } from '@angular/animations';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatFormField, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {GraphDataService} from "../graph-data.service";
import {DrupalDoc} from "../drupal-doc";
import {Operation} from "../opperation";
import {DefaultableMap} from "../defaultable-map";
import {MatButton, MatIconButton} from "@angular/material/button";
import {routes} from "../app.routes";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    RouterLink,
    FaIconComponent,
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
    MatSuffix
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
  protected readonly faSearch = faSearch;
  protected readonly faCog = faCog;

  formControl = new FormControl<string | DrupalDoc | null>(null)

  private filterVal!: string | null
  protected _selectedValue: DrupalDoc | undefined

  options: DefaultableMap<string, DrupalDoc> = new DefaultableMap()

  constructor(private graphData: GraphDataService, protected router: Router) {
    this.formControl.valueChanges.subscribe((val) => {
      if (typeof val === 'string' || val === null) {
        this.filterVal = val;
      } else {
        this._selectedValue = val
        console.log(val)
      }
    })
    graphData.getDocs().subscribe((doc) => {
      console.log("HelloWorld")
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
          console.log(option)
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
    this.router.navigate(['app/', {preselect: JSON.stringify(this._selectedValue)}])
  }
}
