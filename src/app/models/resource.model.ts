export interface Resource {
  _id: string;
  url: string;
  title: string;
  description: string;
  user_id: string;
  collection_id: string;
  domain: string;
  tags: Array<string>;
  favicon: string;
  thumbnail: string;
}
