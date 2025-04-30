export interface Collection{
  _id: string,
  title: string,
  user_id: string,
  resources: Array<string>,
  sharedWith: Array<string>
}
