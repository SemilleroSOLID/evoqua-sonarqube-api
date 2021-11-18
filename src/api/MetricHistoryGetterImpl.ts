import { MetricHistoryGetter } from '@evoqua/types/api';
import { Metric, MetricHistory, Project } from '@evoqua/types/models';

import { Measure, Metric as ApiMetric } from '../models';
import Base from './Base';

export default class MetricHistoryGetterImpl
  extends Base
  implements MetricHistoryGetter
{
  async getMetricHistory(projectKey: Project['key'], metric: Metric)
    : Promise<MetricHistory>
  {
    const url = this.getMetricHistoryRequestURL(projectKey, metric.key);
    const data = await this.request(url);
    return this.getMetricHistoryFromResponse(data, metric.name);
  }

  private getMetricHistoryRequestURL(
    projectKey: Project['key'], metricKey: Metric['key']
  ) {
    const url = this.getEndpoint('/api/measures/search_history');
    url.searchParams.set('component', projectKey);
    url.searchParams.set('metrics', metricKey);
    return url;
  }

  private getMetricHistoryFromResponse(
    response: any, metricName: Metric['name']
  ) : MetricHistory {
    const { history: measureHistory } = response.measures[0] as Measure;
    return {
      metric: metricName,
      versions: measureHistory.map(measure => measure.date),
      values: measureHistory.map(measure => parseFloat(measure.value)),
    };
  }

  /**
   * SonarQube doesn't provide a web service for listing the metrics measured
   * for a particular project. Therefore, this method returns a curated list of
   * metrics, with no regard for the project passed as a parameter.
   */
  async getMetrics(_projectKey: Project['key']): Promise<Metric[]> {
    const url = this.getEndpoint('/api/metrics/search');
    const data = await this.request(url);
    return this.getMetricsFromResponse(data);
  }

  private getMetricsFromResponse(response: any): Metric[] {
    return (response
      .metrics as ApiMetric[])
      .filter(metric => metric.domain === "Maintainability" && !metric.hidden)
      .map(metric => ({ key: metric.key, name: metric.name }));
  }
}
