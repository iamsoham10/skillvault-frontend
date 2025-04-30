import { Resource } from './resource.model';

export interface ResourceAPIResponse {
  resources: {
    resources: Resource[];
    totalResources: number;
  };
}

export interface ResourceAddAPIResonse {
  resource: Resource;
}

export interface ResourceSearchAPIResponse {
  resources: Resource[];
}

export interface ResourceRecommendations {
  data: {
    recommendations: [
      [
        {
          link: string;
          title: string;
        }
      ]
    ];
  };
}
