import { MetricHistoryApi } from '@evoqua/types/api';
import { Metric, MetricHistory } from '@evoqua/types/models';

export default class SonarQubeMetricHistoryApi implements MetricHistoryApi {
  private host: string;

  constructor(host: string) {
    this.host = host;
  }

  async login(username: string, password: string) {
    const url = new URL('/api/authentication/login', this.host);
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: new URLSearchParams({ login: username, password }),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
  }

  async getMetricHistory(projectId: string, metricKey: string)
    : Promise<MetricHistory>
  {
    const url = this.getMetricHistoryRequestURL(projectId, metricKey);
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    return this.getMetricHistoryFromResponse(data);
  }

  private getMetricHistoryRequestURL(projectId: string, metricKey: string) {
    const url = new URL('/api/measures/search_history', this.host);
    url.searchParams.set('component', projectId);
    url.searchParams.set('metrics', metricKey);
    return url;
  }

  private getMetricHistoryFromResponse(response: any): MetricHistory {
    const { metric, history: measureHistory } = response.measures[0];
    return {
      name: metric,
      versions: measureHistory.map(
        (measure: { date: string }) => measure.date),
      values: measureHistory.map(
        (measure: { value: string }) => parseFloat(measure.value)),
    };
  }

  // Turns out SonarQube doesn't need the project ID:
  async getMetrics(_projectId: string): Promise<Metric[]> {
    const url = new URL('/api/metrics/search', this.host);
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    return this.getMetricsFromResponse(data);
  }

  private getMetricsFromResponse(response: any): Metric[] {
    return (
      response
        .metrics
        .filter((metric: { domain: string; hidden: boolean }) =>
                  metric.domain === "Maintainability" && !metric.hidden)
        .map((metric: { key: string; name: string; }) =>
                ({ key: metric.key, label: metric.name }))
    );
  }

  async getProjectIds(): Promise<string[]> {
    const url = new URL('/api/projects/search', this.host);
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    return this.getProjectIdsFromResponse(data);
  }

  private getProjectIdsFromResponse(response: any): string[] {
    return response.components.map(
      // TODO: consider creating a Project model with key and label properties
      // and return those instead of just the project keys:
      (component: { key: string; name: string }) => component.key);
  }
}
