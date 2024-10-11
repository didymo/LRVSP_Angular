export interface DrupalFileUploadResponse {
  changed: Array<{
    value: string,
    format: string
  }>,
  created: Array<{
    value: string,
    format: string
  }>,
  fid: Array<{value: number}>,
  filemime: Array<{ value: string }>,
  filename: Array<{ value: string }>,
  filesize: Array<{ value: number }>,
  langcode: Array<{ value: string }>,
  status: Array<{ value: boolean }>,
  uid: Array<{
    target_id: number,
    target_type: string,
    target_uuid: string,
    url: string
  }>,
  uri: Array<{
    url: string,
    value: string
  }>,
  uuid: Array<{value: string}>
}
