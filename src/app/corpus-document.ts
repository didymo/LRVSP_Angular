export class CorpusDocument {
  id: string
  title: string
  tracked: boolean
  children: Set<CorpusDocument>

  constructor(id: string, title: string, tracked?: bolean, children?: Set<CorpusDocument> ) {
    this.id = id;
    this.title = title
    this.tracked = tracked ?? False
    this.children = children ?? new Set()
  }
}
