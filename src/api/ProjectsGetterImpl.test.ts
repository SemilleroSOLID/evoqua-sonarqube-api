import { ProjectsGetterImpl } from ".";

const { SONAR_URL, SONAR_USERNAME, SONAR_PASSWORD } = process.env;
const api = new ProjectsGetterImpl(SONAR_URL!);

beforeAll(() => api.login(SONAR_USERNAME!, SONAR_PASSWORD!));

it('getProjects', async () => {
  const projects = await api.getProjects();
  expect(projects).toMatchSnapshot();
});
