import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DrupalDoc} from "./drupal-doc";
import {asap, combineLatest, concatAll, map, mergeAll, mergeMap, of, tap, toArray} from "rxjs";
import {DrupalLinkResult} from "./drupal-link";
import {GraphicalNode} from "./simulation-node";
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GraphDataService {
  dataNodes: GraphicalNode[] = [];

  constructor(private http: HttpClient) {
  }

  getAllDocuments() {
    return this.http.get<DrupalDoc[]>(`${environment.apiUrl}/${environment.apiEndpoints.allDocs}`)
      .pipe(
        concatAll(),
        map((doc): GraphicalNode => {
          return {
            x: 0, y: 0,
            fx: null,
            fy: null,
            fixed: false,
            nodeId: doc.id,
            nodeTitle: doc.title,
            linksTo: []
          }
        }),
        mergeMap(result => {
          return combineLatest([
            of(result),
            this.http.get<DrupalLinkResult>(`${environment.apiUrl}/${environment.apiEndpoints.linksForDoc}/${result.nodeId}`).pipe(
              mergeMap((linksResult) => {
                return linksResult.links;
              }),
              map((linkSingle) => {
                return linkSingle.toDoc
              }),
              toArray()
            )
          ])
        }),
        toArray(),
        tap((result) => {
          result.forEach((resultItem) => {
            resultItem[1].forEach(linkId => {
              let linkTarget = result.find((obj) => obj[0].nodeId === linkId)
              if (linkTarget) {
                resultItem[0].linksTo.push(linkTarget[0])
              }
            })
          })
        }),
        concatAll(),
        map(result => {
          return result[0]
        }),
        toArray()
      )
  }
}
