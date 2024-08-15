import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DrupalDoc} from "./drupal-doc";
import {combineLatest, concatAll, map, mergeMap, of, tap, toArray} from "rxjs";
import {DrupalLink, DrupalLinkResult} from "./drupal-link";
import {GraphicalNode} from "./simulation-node";
import { environment } from '../environments/environment';
import {TreeDocument} from "./tree-document";


@Injectable({
  providedIn: 'root'
})
export class GraphDataService {
  dataNodes: GraphicalNode[] = [];

  constructor(private http: HttpClient) {
  }

  // DESIGNED TO WORK WITH didymo/LRVSP_DRUPAL:main#c333e85
  // A naiive approach that needs to be rewritten as we get more docs. Also needs to be rewritten because it's messy as all hell
  getAllDocumentsForGraph() {
    // Need to use a url salt because the backend is caching oddly
    let requestSalt = Math.random();
    return this.http.get<DrupalDoc[]>(`${environment.apiUrl}/${environment.apiEndpoints.allDocs}?random_salt=${requestSalt}`)
      .pipe(
        // 1. Unpack array of Docs from Drupal backend
        concatAll(),
        // 2. Convert Docs as given by Drupal into Nodes
        map((doc): GraphicalNode => {
          return {
            x: 0, y: 0,
            fx: null,
            fy: null,
            fixed: false,
            nodeId: doc.id,
            nodeTitle: atob(doc.title),                 // Doc titles are base64 encoded strings
            linksTo: []
          }
        }),
        // 3. Get all links for each document, wait for result, and keep original data. An absolute mess, but needed at the time
        //    Format is [ GraphicalNode, [ LinkTargetId1, LintTargetId2, ...]]
        mergeMap(result => {
          //Combine latest let's us merge observables.
          return combineLatest([
            of(result),
            this.http.get<DrupalLink[]>(`${environment.apiUrl}/${environment.apiEndpoints.linksForDoc}/${result.nodeId}?random_salt=${requestSalt}`).pipe(
              // Unpack the array into the stream
              concatAll(),
              // grab the target from each link
              map((linkSingle) => {
                return linkSingle.toDoc
              }),
              // Merge the link IDs back into an array
              toArray()
            )
          ])
        }),
        // 4. Pack the individual link/target packs into a single array (format [[ GraphicalNode, [ LinkTargetId1, LintTargetId2, ...]]...]
        toArray(),
        // 5. tap lets us access elements on the stream without removing them. Useful for logging, or for opeerations
        //    that are purely side effects - i.e. data manipulation.
        //    We operate on the large array because we need to have access to all the nodes at once.
        tap((result) => {
          // For each Document and its targets
          result.forEach((resultItem) => {
            // For each of the documents targets
            resultItem[1].forEach(linkId => {
              // Find the document that matches the target
              let linkTarget = result.find((obj) => obj[0].nodeId === linkId)
              // If the target exists, push it into the documents 'linksTo' array
              if (linkTarget) {
                resultItem[0].linksTo.push(linkTarget[0])
              }
            })
          })
        }),
        // Unpack the array onto the stream
        concatAll(),
        // Just grab the documents themselves, we're done with the links
        map(result => {
          return result[0]
        }),
        // Pack it back up, because the consumer was written to expect an array of docs.
        toArray()
      )
  }

  getAllDocumentsForTree() {
    // Need to use a url salt because the backend is caching oddly
    let requestSalt = Math.random();
    return this.http.get<DrupalDoc[]>(`${environment.apiUrl}/${environment.apiEndpoints.allDocs}?random_salt=${requestSalt}`)
      .pipe(
        concatAll(),
        map((doc) => {
          return new TreeDocument(doc.id, atob(doc.title))
        }),
        mergeMap(result => {
          //Combine latest let's us merge observables.
          return combineLatest([
            of(result),
            this.http.get<DrupalLink[]>(`${environment.apiUrl}/${environment.apiEndpoints.linksForDoc}/${result.nodeId}?random_salt=${requestSalt}`).pipe(
              // Unpack the array into the stream
              concatAll(),
              // grab the target from each link
              map((linkSingle) => {
                return linkSingle.toDoc
              }),
              // Merge the link IDs back into an array
              toArray()
            )
          ])
        }),
        toArray(),
        tap((result) => {
          // For each Document and its targets
          result.forEach((resultItem) => {
            // For each of the documents targets
            resultItem[1].forEach(linkId => {
              // Find the document that matches the target
              let linkTarget = result.find((obj) => obj[0].nodeId === linkId)
              // If the target exists, push it into the documents 'linksTo' array
              if (linkTarget) {
                resultItem[0].linksTo.add(linkTarget[0])
              }
            })
          })
        }),
        concatAll(),
        map((result) => {
          return result[0]
        }),
        toArray()
      )
  }
}
