import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {DrupalDoc} from "./drupal-doc";
import {
  combineLatest,
  concatAll,
  finalize,
  map,
  mergeMap,
  Observable, Observer,
  of,
  pipe, startWith, Subject,
  tap,
  toArray,
  UnaryFunction
} from "rxjs";
import {DrupalLink} from "./drupal-link";
import {GraphicalNode} from "./simulation-node";
import { environment } from '../environments/environment';
import {Operation} from "./opperation";
import {DataOperation} from "./data-operation";


@Injectable({
  providedIn: 'root'
})
export class GraphDataService {
  documentCache: Map<String, DrupalDoc> = new Map()
  linkCache: Map<String, DrupalLink[]> = new Map()
  private documentConsumers: Subject<DataOperation<DrupalDoc>>[] = []
  private linkConsumers: Subject<DataOperation<DrupalLink>>[] = []
  private registeredServiceRequests: ServiceRequest<any, any>[] = []
  private serviceQueue: ServiceRequest<any, any>[] = []
  private rejectedServiceRequests: {req: ServiceRequest<any, any>, reason: string}[] = []
  private activeRequestCount = 0;
  private serviceTicker



  constructor(private http: HttpClient) {
    // Every second, we can have up to 10 requests in flight. serviceRequestTick() is the function that fires each
    // second to handle bookkeeping and dispatching
    this.serviceRequestTick()
    this.serviceTicker = setInterval(this.serviceRequestTick.bind(this), 1000)
    console.log(this)
  }

  // Workaround for Javascript's ancient b64 decode.
  // See https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
  b64DecodeUTF8(b64String: string): string {
    const binString = atob(b64String);
    const uintArray = Uint8Array.from(binString, (m) => m.codePointAt(0)!)
    return new TextDecoder().decode(uintArray)
  }

  // Workaround for Javascript's ancient b64 encode. Added now because it's almost certain that we're going to need it
  b64EncodeUTF8(data: string): string {
    const uintArray = new TextEncoder().encode(data)
    const binString = Array.from(uintArray, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString)
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
            nodeTitle: this.b64DecodeUTF8(doc.title),                 // Doc titles are base64 encoded strings
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

  getDocs(): Observable<DataOperation<DrupalDoc>>{
    let url = `${environment.apiUrl}/${environment.apiEndpoints.allDocs}`
    let newConsumer = new Subject<DataOperation<DrupalDoc>>()
    this.documentConsumers.push(newConsumer)
    let returnObservable = newConsumer.pipe(
      startWith(...Array.from(this.documentCache.values()).map((doc):DataOperation<DrupalDoc> => {
        return {
          operation: Operation.CREATE,
          data: doc
        }
      }))
    )
    let req = new ServiceRequest<DrupalDoc[], DrupalDoc[]>(url, pipe(
      concatAll(),
      tap((doc) => {
        doc.title = this.b64DecodeUTF8(doc.title)
      }),
      toArray()
    ), (drupalDocs: DrupalDoc[]) => {
      for (let doc of drupalDocs) {
        if (!this.documentCache.has(doc.id)) {
          this.documentCache.set(doc.id, doc);
          for (let consumer of this.documentConsumers) {
            consumer.next({
              operation: Operation.CREATE,
              data: doc
            })
          }
        } else if (!deepEquals(this.documentCache.get(doc.id), doc)) {
          this.documentCache.set(doc.id, doc);
          for (let consumer of this.documentConsumers) {
            consumer.next({
              operation: Operation.UPDATE,
              data: doc
            })
          }
        }
      }
      for (let key of this.documentCache.keys()) {
        if (!drupalDocs.some((doc) => key === doc.id)) {
          for (let consumer of this.documentConsumers) {
            consumer.next({
              operation: Operation.DELETE,
              data: this.documentCache.get(key)!
            })
          }
          this.documentCache.delete(key)
        }
      }
    }, true )
    this.registerServiceRequest(req)
    return returnObservable
  }

  getLinks(docId: string): Observable<DataOperation<DrupalLink>> {
    let url = `${environment.apiUrl}/${environment.apiEndpoints.linksForDoc}/${docId}`
    let newConsumer = new Subject<DataOperation<DrupalLink>>()
    this.linkConsumers.push(newConsumer)
    let returnObservable = newConsumer.pipe(
      startWith(...Array.from(this.linkCache.values())
        .flatMap((linkArray): DataOperation<DrupalLink>[] => {
          return linkArray.map((link): DataOperation<DrupalLink> => {
            return {
              operation: Operation.CREATE,
              data: link
            }
          })
        })
      )
    )
    let req = new ServiceRequest<DrupalLink[], DrupalLink[]>(url, pipe(), (drupalLinks: DrupalLink[]) => {
      if (!this.linkCache.has(docId)) {
        this.linkCache.set(docId, [])
      }
      let cachedLinks: DrupalLink[] = this.linkCache.get(docId)!
      for (let link of drupalLinks) {
        if (!cachedLinks.some((cachedLink) => cachedLink.toDoc === link.toDoc)) {
          cachedLinks.push(link)
          for (let consumer of this.linkConsumers) {
            consumer.next({
              operation: Operation.CREATE,
              data: link
            })
          }
        }
      }
      for (let cachedLink of cachedLinks.slice(0)) {
        if (!drupalLinks.some((link) => link.toDoc === cachedLink.toDoc)) {
          for (let consumer of this.linkConsumers) {
            consumer.next({
              operation: Operation.DELETE,
              data: cachedLink
            })
          }
          this.linkCache.set(docId, this.linkCache.get(docId)!.filter(
            link => link.toDoc !== cachedLink.toDoc
          ))
        }
      }
    }, true)
    this.registerServiceRequest(req)
    return returnObservable
  }

  private registerServiceRequest(req: ServiceRequest<any, any>) {
    if (req.repeat) {
      let foundReq = this.registeredServiceRequests.find((potMatch) => {return potMatch.url === req.url})
      if (!foundReq) {
        this.registeredServiceRequests.push(req)
        this.serviceQueue.push(req)
      } else {
        foundReq.fresh = true
      }
    } else {
      this.serviceQueue.push(req)
    }
  }

  private serviceRequestTick() {
    console.log(`Service Tick: ${this.activeRequestCount} active requests, ${this.serviceQueue.length} requests in queue.`)
    // Any service requests that we ignored last run, add them back to the active queue, and clear the lis tof rejected requests.
    this.serviceQueue.push(...this.rejectedServiceRequests.map((a) => a.req))
    this.rejectedServiceRequests = []

    // 'Fresh' requests are requests that have either just been created, or have been explicitly requested by something.
    // We want to give them priority
    this.serviceQueue.sort((a, b) => {
      return Number(a.fresh) - Number(b.fresh)
    })
    while(this.activeRequestCount < 10 && this.serviceQueue.length > 0) {
      let req = this.serviceQueue.shift()!
      // We don't want to run a single request too frequently, so we reject it if it was run less than a second ago
      if (req.lastRun < Math.floor(Date.now() / 1000) - 1) {
        this.handleServiceRequest(req)
      } else {
        this.rejectedServiceRequests.push({req: req, reason: "Last ran too recently"})
      }
    }
    if (this.rejectedServiceRequests.length > 0) {
      console.log(`Rejected ${this.rejectedServiceRequests.length} requests.`)
      console.log(this.rejectedServiceRequests)
    }
  }

  private handleServiceRequest(req: ServiceRequest<any, any>) {
    // Mark the request as handled for the next time round
    this.activeRequestCount++
    req.lastRun = Math.floor(Date.now() / 1000)
    req.fresh = false
    // The random salt is used to work around some odd caching behaviour we saw in Drupal
    this.http.get(req.url + `?randomSalt=${Math.random()}`).pipe(
      // Apply the pipe operator as specified by the request
      req.pipeOperator,
      // Remove this request from the active count once it completes. If it's meant to be a repeating request, add it back to the queue
      finalize(() => {
        this.activeRequestCount--
        if (req.repeat) {
          this.serviceQueue.push(req)
        }
      })
    ).subscribe(
      req.observerOrNext
    )
  }

}

class ServiceRequest<T, U> {
  url: string
  fresh: boolean = true
  observerOrNext: Partial<Observer<U>> | ((value: U) => void)
  pipeOperator: UnaryFunction<Observable<T>, Observable<U>>
  repeat: boolean
  lastRun: number = 0

  constructor(url: string, pipeOperator: UnaryFunction<Observable<T>, Observable<U>>, observerOrNext?: Partial<Observer<U>> | ((value: U) => void), repeat?: boolean) {
    this.url = url
    this.pipeOperator = pipeOperator
    this.repeat = repeat ?? false
    this.observerOrNext = observerOrNext ?? {}
  }
}

//Deeply compare two objects by value
function deepEquals(object1: any, object2: any) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  // Early exit if the objects don't have the same number of keys
  if (keys1.length !== keys2.length) {
    return false;
  }
  // compare the values of keys , using deep comparisons if needed.
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      areObjects && !deepEquals(val1, val2) ||
      !areObjects && val1 !== val2
    ) {
      return false;
    }
  }
  return true;
}

function isObject(object: Object) {
  return object != null && typeof object === 'object';
}
