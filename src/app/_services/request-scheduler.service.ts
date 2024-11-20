import { Injectable } from '@angular/core';
import {DefaultableMap} from "../_classes/defaultable-map";
import {finalize, Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RequestSchedulerService {
  private queuedRequests: ScheduledRequest<any>[] = []
  private handledRequests: ScheduledRequest<any>[] = []
  private rejectedRequests: ScheduledRequest<any>[] = []
  private registeredRequests = new DefaultableMap<URL, ScheduledRequest<any>>();
  private _activeRequestCount = 0
  private get activeRequestCount() {
    return this._activeRequestCount
  }
  private set activeRequestCount(newval: number) {
    const was = this._activeRequestCount
    this._activeRequestCount = newval
    const now = this._activeRequestCount
    if (was >= environment.requestScheduler.maxActiveRequests && now < environment.requestScheduler.maxActiveRequests) {
      setTimeout(this.requestHandlerTick.bind(this), 0)
    }
  }


  constructor(private httpClient: HttpClient) {
    // Every second, we can have up to 10 requests in flight. serviceRequestTick() is the function that fires each
    // second to handle bookkeeping and dispatching
    this.requestHandlerTick()
    setInterval(this.requestHandlerTick.bind(this), 100)
  }

  public registerRequest<T>(url: URL, repeat: boolean): Observable<T> {
    const request = this.registeredRequests.getOrSetDefault(url, {
      url: url,
      repeat: repeat,
      fresh: true,
      scheduled: false,
      lastRun: 0,
      subject: new Subject<T>()
    })

    if (!request.scheduled) {
      this.queuedRequests.push(request)
      request.scheduled = true
    }

    request.fresh = true;

    return request.subject;
  }

  private handleRequest(request: ScheduledRequest<any>) {
    request.fresh = false;
    if (!request.repeat) {
      request.scheduled = false
    }

    this.activeRequestCount++
    request.lastRun = Date.now()

    const saltedUrl = new URL(request.url)
    saltedUrl.searchParams.set("randomSalt", Math.random().toString())

    this.httpClient.get(saltedUrl.toString()).pipe(
      finalize(() => {
        this.activeRequestCount--
      })
    ).subscribe(
      (val) => {request.subject.next(val)}
    )
  }

  private requestHandlerTick() {
    //Sort queued requests
    this.queuedRequests.sort((a, b) => {
      return Number(a.fresh) - Number(b.fresh) || a.lastRun - b.lastRun
    })

    //While we have slots available, and also have requests left to process, try to process requests
    while (this.activeRequestCount < environment.requestScheduler.maxActiveRequests && this.queuedRequests.length > 0) {
      const request = this.queuedRequests.shift()!;
      const runDelta = Date.now() - request.lastRun;
      // console.log(request.fresh, runDelta)
      if (!request.fresh && runDelta < environment.requestScheduler.minimumRequestTimeDelta * 1000) {
	      // console.log("Rejected request: ", request)
        this.rejectedRequests.push(request)
        continue;
      }
      this.handleRequest(request)
      this.handledRequests.push(request);
    }

    // Decide if we should reschedule our handled requests
    this.handledRequests.forEach((request) => {
      if (request.scheduled) {
        this.queuedRequests.push(request)
      }
    })
    this.handledRequests = []

    //Reschedule the requests we rejected
    this.rejectedRequests.forEach((request) => {
      this.queuedRequests.push(request)
    })
    this.rejectedRequests = []
  }
}

interface ScheduledRequest<T> {
  url: URL
  repeat: boolean,
  fresh: boolean,
  scheduled: boolean,
  lastRun: number,
  subject: Subject<T>
}
