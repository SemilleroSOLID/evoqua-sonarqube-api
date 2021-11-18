export interface Analysis {
  date: string;
  // ...
}

export interface Component {
  key: string;
  name: string;
  // ...
}

export interface Measure {
  metric: string;
  history: Array<{
    date: string;
    value: string;
  }>;
}

export interface Metric {
  key: string;
  name: string;
  domain: string;
  hidden: boolean;
  // ...
}
