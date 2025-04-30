import { Collection } from './collection.model';

export interface CollectionAPIResponse {
  AllCollections: {
    collections: Collection[];
    totalNoOfCollections: number;
  };
}
export interface CollectionSearchAPIResponse {
  collections: Collection[];
}
export interface CollectionAddResponse {
  collection: Collection;
}
export interface DecodedToken {
  user_id: string;
  email: string;
  user_privateID: string;
}
