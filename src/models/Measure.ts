export default interface Measure {
  metric: string;
  history: Array<{
    date: string;
    value: string;
  }>;
}
