export interface DrupalFileUploadResponse {
  changed: {
    value: string,
    format: string
  }[],
  created: {
    value: string,
    format: string
  }[],
  fid: {value: number}[],
  filemime: { value: string }[],
  filename: { value: string }[],
  filesize: { value: number }[],
  langcode: { value: string }[],
  status: { value: boolean }[],
  uid: {
    target_id: number,
    target_type: string,
    target_uuid: string,
    url: string
  }[],
  uri: {
    url: string,
    value: string
  }[],
  uuid: {value: string}[]
}
