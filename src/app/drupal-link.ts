import {DrupalDoc} from "./drupal-doc";

export interface DrupalLink {
  fromDoc: string
  toDoc: string
}

export interface DrupalLinkResult {
  docs: DrupalDoc[]
  links: DrupalLink[]
}
