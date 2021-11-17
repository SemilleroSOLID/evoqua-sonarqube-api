import { VersionMetricsGetterImpl } from ".";

const { SONAR_URL, SONAR_USERNAME, SONAR_PASSWORD } = process.env;
const api = new VersionMetricsGetterImpl(SONAR_URL!);

beforeAll(() => api.login(SONAR_USERNAME!, SONAR_PASSWORD!));

it('getVersions', async () => {
  const projectId = 'SCAPE-app';
  const versions = await api.getVersions(projectId);
  expect(versions).toMatchSnapshot();
});

it('getVersionMetrics', async () => {
  const projectId = 'SCAPE-app';
  const version = '2021-05-07T09:42:24-0500';
  const metrics = [
    { key: 'code_smells', name: 'Code Smells' },
    { key: 'sqale_index', name: 'Technical Debt' },
  ];
  const versionMetrics =
    await api.getVersionMetrics(projectId, version, metrics);
  expect(versionMetrics).toMatchSnapshot();
});
