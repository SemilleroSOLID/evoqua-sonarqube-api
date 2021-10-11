require('dotenv').config();

import fetchCookie from 'fetch-cookie';
import nodeFetch from 'node-fetch';

import SonarQubeMetricHistoryApi from "./index";

// We're patching the global fetch method to store cookies needed for
// authorizing API requests:
// TODO: use a headless browser to test how a browser would actually handle the
// requests (in regards to cookies and CORS):
globalThis.fetch = fetchCookie(nodeFetch) as unknown as typeof fetch;

describe('SonarQubeMetricHistoryApi tests', () => {
  const api = new SonarQubeMetricHistoryApi(process.env.SONAR_URL!);

  beforeAll(async () => {
    await api.login(process.env.SONAR_USERNAME!, process.env.SONAR_PASSWORD!);
  });

  it('getProjectIds', async () => {
    const projectIds = await api.getProjectIds();
    expect(projectIds).toMatchSnapshot();
  });

  it('getMetrics', async () => {
    const metrics = await api.getMetrics('SCAPE-app');
    expect(metrics).toMatchSnapshot();
  });

  it('getMetricHistory', async () => {
    const metricHistory =
      await api.getMetricHistory('SCAPE-app', 'code_smells');
    expect(metricHistory).toMatchSnapshot();
  });
});
