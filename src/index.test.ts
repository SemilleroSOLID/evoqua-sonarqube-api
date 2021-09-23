require('dotenv').config();

import fetch, { Headers } from 'node-fetch';

import SonarQubeMetricHistoryApi from "./index";

// We're patching the global fetch method to store cookies needed for
// authorizing API requests:
const cookies = new Set<string>();
globalThis.fetch = async (url: RequestInfo, init: RequestInit | undefined) => {
  if (cookies.size > 0) {
    const headers = new Headers(init?.headers);
    headers.set('Cookie', Array.from(cookies).join('; '));
    init = Object.assign(init ?? {}, { headers });
  }
  const response = await fetch(url as any, init as any);
  response.headers.raw()['set-cookie']?.forEach(cookie => cookies.add(cookie));
  return response as any;
};

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
