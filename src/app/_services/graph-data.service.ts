import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DrupalDoc} from "../_interfaces/drupal-doc";
import {
  concatAll,
  finalize,
  Observable,
  Observer,
  pipe,
  startWith,
  Subject,
  Subscription,
  tap,
  UnaryFunction
} from "rxjs";
import {DrupalLink} from "../_interfaces/drupal-link";
import {environment} from '../../environments/environment';
import {Operation} from "../_enums/opperation";
import {DataOperation} from "../_interfaces/data-operation";
import {DrupalDocDetails} from "../_interfaces/drupal-doc-details";
import {RequestSchedulerService} from "./request-scheduler.service";
import {DefaultableMap} from "../_classes/defaultable-map";
import {DrupalFileUploadResponse} from "../_interfaces/drupal-file-upload-response";


@Injectable({
  providedIn: 'root'
})
export class GraphDataService {
  private documentCache: Map<String, DrupalDoc> = new Map()
  private linkCache: DefaultableMap<String, DrupalLink[]> = new DefaultableMap()
  private documentSubject: Subject<DataOperation<DrupalDoc>> = new Subject()
  private linkSubscriptions: DefaultableMap<String, {subscription: Subscription, subject: Subject<DataOperation<DrupalLink>>}> = new DefaultableMap()
  private linkConsumers: Subject<DataOperation<DrupalLink>>[] = []

  constructor(private httpClient: HttpClient, private requestScheduler: RequestSchedulerService) {
    const documentUrl = new URL(environment.apiEndpoints.allDocs, environment.apiUrl)
    this.requestScheduler.registerRequest<DrupalDoc[]>(documentUrl, true).pipe(
      tap((docs) => {
        for (const key of this.documentCache.keys()) {
          if (!docs.some((doc) => key === doc.id)) {
            this.documentSubject.next({
              operation: Operation.DELETE,
              data: this.documentCache.get(key)!
            })
            this.documentCache.delete(key)
          }
        }
      }),
      concatAll(),
      tap((doc) => {
        doc.title = this.b64DecodeUTF8(doc.title)
        if (!this.documentCache.has(doc.id)) {
          this.documentCache.set(doc.id, doc);
          this.documentSubject.next({
            operation: Operation.CREATE,
            data: doc
          })
        } else if (!deepEquals(this.documentCache.get(doc.id), doc)) {
          this.documentCache.set(doc.id, doc);
          this.documentSubject.next({
            operation: Operation.UPDATE,
            data: doc
          })
        }
      })
    ).subscribe()
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

  getDocs(): Observable<DataOperation<DrupalDoc>>{
    return this.documentSubject.pipe(
      startWith(...Array.from(this.documentCache.values()).map((doc):DataOperation<DrupalDoc> => {
        return {
          operation: Operation.CREATE,
          data: doc
        }
      }))
    )
  }

  getLinks(docId: string): Observable<DataOperation<DrupalLink>> {
    const linkUrl = new URL(`${environment.apiEndpoints.linksForDoc}/${docId}`, environment.apiUrl)
    let linkSubject: Observable<DataOperation<DrupalLink>> = this.linkSubscriptions.getOrSetDefaultDefer(docId, () => {
      let newLinkSubject = new Subject<DataOperation<DrupalLink>>()
      return {
        subscription: this.requestScheduler.registerRequest<DrupalLink[]>(linkUrl, true).pipe(
          tap((links) => {
            let cachedLinks = this.linkCache.getOrSetDefault(docId, [])
            for (const cachedLink of cachedLinks.slice(0)) {
              if (!links.some((link) => link.fromDoc === cachedLink.fromDoc)) {
                newLinkSubject.next({
                  operation: Operation.DELETE,
                  data: cachedLink
                })
                this.linkCache.set(docId, cachedLinks.filter(
                  link => link.toDoc !== cachedLink.toDoc
                ))
              }
            }
          }),
          concatAll(),
          tap(link => {
            let cachedLinks = this.linkCache.getOrSetDefault(docId, []);
            if (!cachedLinks.some((cachedLink) => cachedLink.toDoc === link.toDoc)) {
              newLinkSubject.next({
                operation: Operation.CREATE,
                data: link
              })
              cachedLinks.push(link)
            }
          })
        ).subscribe(),
        subject: newLinkSubject
      }
    }).subject.pipe(
      startWith(...this.linkCache.getOrSetDefault(docId, []).map((link):DataOperation<DrupalLink> => {
        return {
          operation: Operation.CREATE,
          data: link
        }
      }))
    )
    return linkSubject
  }

  getDocDetails(docId: string): Observable<DrupalDocDetails> {
    let url = `${environment.apiUrl}/${environment.apiEndpoints.docDetails}/${docId}`
    return this.httpClient.get<DrupalDocDetails>(url)
  }

  uploadPdfFile(file: File): Observable<DrupalFileUploadResponse> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/octet-stream')
      .set('Content-Disposition', `filename="${file.name}"`)
    let url = `${environment.apiUrl}/${environment.apiEndpoints.fileUpload}/lrvsp_docfile/_/pdf`
    return this.httpClient.post<DrupalFileUploadResponse>(url, file, {headers: headers})
  }

  uploadProcessingFile(file: File) {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/octet-stream')
      .set('Content-Disposition', `filename="${file.name}"`)
    let url = `${environment.apiUrl}/${environment.apiEndpoints.fileUpload}/lrvsp_docfile/_/processFile`
    return this.httpClient.post<DrupalFileUploadResponse>(url, file, {headers: headers})
  }

  createDocFile(pdfId: number, processingId: number | null): Observable<any> {
    let url = `${environment.apiUrl}/${environment.apiEndpoints.createDocfile}`
    return this.httpClient.post(url, {pdfId: pdfId, processId: processingId})
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
