import { VersionMetricsGetter } from '@evoqua/types/api';
import {
  Metric,
  VersionMetrics,
  Project,
  Version,
} from '@evoqua/types/models';

import { Analysis, Measure } from '../models';
import SensibleMap from '../utils/SensibleMap';
import Base from './Base';

export default class VersionMetricsGetterImpl
  extends Base
  implements VersionMetricsGetter
{
  async getVersionMetrics(
    projectKey: Project['key'], version: Version, metrics: Metric[]
  ): Promise<VersionMetrics> {
    const url = this.getVersionMetricsRequestURL(projectKey, version, metrics);
    const data = await this.request(url);
    return this.getVersionMetricsFromResponse(data, version, metrics);
  }

  private getVersionMetricsRequestURL(
    projectKey: Project['key'], version: Version, metrics: Metric[]
  ) {
    const url = this.getEndpoint('/api/measures/search_history');
    url.searchParams.set('component', projectKey);
    url.searchParams.set('from', version);
    url.searchParams.set('to', version);
    url.searchParams.set('metrics',
      metrics.map(metric => metric.key).join(','));
    return url;
  }

  private getVersionMetricsFromResponse(
    response: any, version: Version, metrics: Metric[]
  ): VersionMetrics {
    const { measures } = response as { measures: Measure[] };
    const metricsNamesByKey =
      new SensibleMap(metrics.map(metric => [metric.key, metric.name]));
    return {
      // In theory, we could get this from one of the measures, but this way is
      // easier:
      version,
      metrics: measures.map(
        measure => metricsNamesByKey.getOrThrow(measure.metric)),
      values: measures.flatMap(
        ({ history: measureHistory }) =>
          measureHistory.map(measure => parseFloat(measure.value))),
    };
  }

  async getVersions(projectKey: Project['key']): Promise<string[]> {
    const url = this.getVersionsRequestURL(projectKey);
    const data = await this.request(url);
    return this.getVersionsFromResponse(data);
  }

  private getVersionsRequestURL(projectKey: Project['key']) {
    const url = this.getEndpoint('/api/project_analyses/search');
    url.searchParams.set('project', projectKey);
    return url;
  }

  private getVersionsFromResponse(response: any): string[] {
    return (response
      .analyses as Analysis[])
      .map(analysis => analysis.date);
  }
}
