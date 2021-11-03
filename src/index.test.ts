require('dotenv').config();

import fetchCookie from 'fetch-cookie';
import nodeFetch from 'node-fetch';

import SonarQubeApi from "./index";

// We're patching the global fetch method to store cookies needed for
// authorizing API requests:
// TODO: use a headless browser to test how a browser would actually handle the
// requests (in regards to cookies and CORS):
globalThis.fetch = fetchCookie(nodeFetch) as unknown as typeof fetch;

describe('MetricHistoryApi tests', () => {
  const api = new SonarQubeApi(process.env.SONAR_URL!);

  beforeAll(async () => {
    await api.login(process.env.SONAR_USERNAME!, process.env.SONAR_PASSWORD!);
  });

  it('getProjectIds', async () => {
    const projectIds = await api.getProjectIds();
    expect(projectIds).toMatchSnapshot();
  });

  it('getMetrics', async () => {
    const projectId = 'SCAPE-app';
    const metrics = await api.getMetrics(projectId);
    expect(metrics).toMatchSnapshot();
  });

  it('getMetricHistory', async () => {
    const projectId = 'SCAPE-app';
    const metricKey = 'code_smells';
    const metricHistory =
      await api.getMetricHistory(projectId, metricKey);
    expect(metricHistory).toMatchSnapshot();
  });
});

describe('VersionMetricsApi tests', () => {
  const api = new SonarQubeApi(process.env.SONAR_URL!);

  beforeAll(async () => {
    await api.login(process.env.SONAR_USERNAME!, process.env.SONAR_PASSWORD!);
  });

  it('getVersions', async () => {
    const projectId = 'SCAPE-app';
    const versions = await api.getVersions(projectId);
    expect(versions).toMatchSnapshot();
  });

  it('getVersionMetrics', async () => {
    const projectId = 'SCAPE-app';
    const version = '2021-05-07T09:42:24-0500';
    const metrics = [
      { key: 'code_smells', label: 'Code Smells' },
      { key: 'sqale_index', label: 'Technical Debt' },
    ]
    const versionMetrics =
      await api.getVersionMetrics(projectId, version, metrics);
    expect(versionMetrics).toMatchSnapshot();
  });
});
