import {Operation} from "./opperation";

export interface DataOperation<T> {
  operation: Operation;
  data: T
}
