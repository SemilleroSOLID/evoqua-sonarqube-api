import { MetricHistoryGetterImpl } from ".";

const { SONAR_URL, SONAR_USERNAME, SONAR_PASSWORD } = process.env;
const api = new MetricHistoryGetterImpl(SONAR_URL!);

beforeAll(() => api.login(SONAR_USERNAME!, SONAR_PASSWORD!));

it('getMetrics', async () => {
  const projectId = 'SCAPE-app';
  const metrics = await api.getMetrics(projectId);
  expect(metrics).toMatchSnapshot();
});

it('getMetricHistory', async () => {
  const projectId = 'SCAPE-app';
  const metric = {
    key: 'code_smells',
    name: 'Code Smells',
  };
  const metricHistory = await api.getMetricHistory(projectId, metric);
  expect(metricHistory).toMatchSnapshot();
});
