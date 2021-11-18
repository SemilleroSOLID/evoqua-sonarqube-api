import {
  MetricHistoryGetter,
  ProjectsGetter,
  VersionMetricsGetter,
} from '@evoqua/types/api';
import { Metric, Project, Version } from '@evoqua/types/models';

import {
  Base,
  MetricHistoryGetterImpl,
  ProjectsGetterImpl,
  VersionMetricsGetterImpl,
} from './api';

// TODO: consider using mixins: https://www.typescriptlang.org/docs/handbook/mixins.html
export default class SonarQubeApi
  extends Base
  implements MetricHistoryGetter, ProjectsGetter, VersionMetricsGetter
{
  private metricHistoryGetter: MetricHistoryGetter;
  private projectsGetter: ProjectsGetter;
  private versionMetricsGetter: VersionMetricsGetter;

  constructor(host: string) {
    super(host);
    this.metricHistoryGetter = new MetricHistoryGetterImpl(host);
    this.projectsGetter = new ProjectsGetterImpl(host);
    this.versionMetricsGetter = new VersionMetricsGetterImpl(host);
  }

  getMetricHistory(projectKey: Project['key'], metric: Metric) {
    return this.metricHistoryGetter.getMetricHistory(projectKey, metric);
  }

  getMetrics(projectKey: Project['key']) {
    return this.metricHistoryGetter.getMetrics(projectKey);
  }

  getProjects() {
    return this.projectsGetter.getProjects();
  }

  getVersionMetrics(
    projectKey: Project['key'], version: Version, metrics: Metric[]
  ) {
    return this.versionMetricsGetter.getVersionMetrics(
      projectKey, version, metrics);
  }

  getVersions(projectKey: Project['key']): Promise<string[]> {
    return this.versionMetricsGetter.getVersions(projectKey);
  }
}
