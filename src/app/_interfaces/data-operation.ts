import {Operation} from "../_enums/opperation";

export interface DataOperation<T> {
  operation: Operation;
  data: T
}
