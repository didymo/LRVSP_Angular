import {Component} from '@angular/core';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {GraphDataService} from "../../_services/graph-data.service";
import {MatList, MatListItem, MatListItemIcon, MatListItemTitle, MatNavList} from "@angular/material/list";
import {DrupalDoc} from "../../_interfaces/drupal-doc";
import {DefaultableMap} from "../../_classes/defaultable-map";
import {DataOperation} from "../../_interfaces/data-operation";
import {Operation} from "../../_enums/opperation";
import {NgForOf} from "@angular/common";
import {MatToolbar, MatToolbarRow} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {RouterLink, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [
    MatSidenavContainer,
    MatSidenavContent,
    MatSidenav,
    MatListItem,
    MatList,
    NgForOf,
    MatToolbar,
    MatToolbarRow,
    MatNavList,
    MatIcon,
    MatListItemTitle,
    MatListItemIcon,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './file-management.component.html',
  styleUrl: './file-management.component.scss'
})
export class FileManagementComponent {
  protected docs = new DefaultableMap<string, DrupalDoc>()

  constructor(private graphDataService: GraphDataService) {
    graphDataService.getDocs().subscribe(
      (dataOp: DataOperation<DrupalDoc>) => {
        switch (dataOp.operation) {
          case Operation.CREATE:
          case Operation.UPDATE:
            this.docs.set(dataOp.data.id, dataOp.data)
            break;
          case Operation.DELETE:
            this.docs.delete(dataOp.data.id)
        }
      }
    )
  }
}
