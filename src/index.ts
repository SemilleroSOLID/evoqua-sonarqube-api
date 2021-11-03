import { MetricHistoryApi, VersionMetricsApi } from '@evoqua/types/api';
import { Metric, MetricHistory, VersionMetrics } from '@evoqua/types/models';

import Measure from './models/Measure';
import SensibleMap from './utils/SensibleMap';

export default class SonarQubeApi
  implements MetricHistoryApi, VersionMetricsApi
{
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

  private async request(url: URL) {
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  }

  async getMetricHistory(projectId: string, metricKey: string)
    : Promise<MetricHistory>
  {
    const url = this.getMetricHistoryRequestURL(projectId, metricKey);
    const data = await this.request(url);
    return this.getMetricHistoryFromResponse(data);
  }

  private getMetricHistoryRequestURL(projectId: string, metricKey: string) {
    const url = new URL('/api/measures/search_history', this.host);
    url.searchParams.set('component', projectId);
    url.searchParams.set('metrics', metricKey);
    return url;
  }

  private getMetricHistoryFromResponse(response: any): MetricHistory {
    const {
      metric,
      history: measureHistory,
    } = response.measures[0] as Measure;
    return {
      name: metric,
      versions: measureHistory.map(measure => measure.date),
      values: measureHistory.map(measure => parseFloat(measure.value)),
    };
  }

  // Turns out SonarQube doesn't need the project ID:
  async getMetrics(_projectId: string): Promise<Metric[]> {
    const url = new URL('/api/metrics/search', this.host);
    const data = await this.request(url);
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
    const data = await this.request(url);
    return this.getProjectIdsFromResponse(data);
  }

  private getProjectIdsFromResponse(response: any): string[] {
    return response.components.map(
      // TODO: consider creating a Project model with key and label properties
      // and return those instead of just the project keys:
      (component: { key: string; name: string }) => component.key);
  }

  async getVersionMetrics(
    projectId: string, version: string, metrics: Metric[]
  ): Promise<VersionMetrics> {
    const url = this.getVersionMetricsRequestURL(projectId, version, metrics);
    const data = await this.request(url);
    return this.getVersionMetricsFromResponse(data, version, metrics);
  }

  private getVersionMetricsRequestURL(
    projectId: string, version: string, metrics: Metric[]
  ) {
    const url = new URL('/api/measures/search_history', this.host);
    url.searchParams.set('component', projectId);
    url.searchParams.set('from', version);
    url.searchParams.set('to', version);
    url.searchParams.set('metrics',
      metrics.map(metric => metric.key).join(','));
    return url;
  }

  private getVersionMetricsFromResponse(
    response: any, version: string, metrics: Metric[]
  ): VersionMetrics {
    const { measures } = response as { measures: Measure[] };
    const metricsLabelsByKey =
      new SensibleMap(metrics.map(({ key, label }) => [key, label]));
    return {
      // In theory we could get this from one of the measures, but this way
      // it's easier:
      version,
      metrics: measures.map(
        measure => metricsLabelsByKey.getOrThrow(measure.metric)),
      values: measures.flatMap(
        ({ history: measureHistory }) =>
          measureHistory.map(measure => parseFloat(measure.value))),
    };
  }

  async getVersions(projectId: string): Promise<string[]> {
    const url = this.getVersionsRequestURL(projectId);
    const data = await this.request(url);
    return this.getVersionsFromResponse(data);
  }

  private getVersionsRequestURL(projectId: string) {
    const url = new URL('/api/measures/component', this.host);
    url.searchParams.set('component', projectId);
    url.searchParams.set('additionalFields', 'periods');
    // Required. We pass one of the most commonly measured metrics:
    url.searchParams.set('metricKeys', 'ncloc');
    return url;
  }

  private getVersionsFromResponse(response: any): string[] {
    return response.periods.map(({ date }: { date: string; }) => date);
  }
}
