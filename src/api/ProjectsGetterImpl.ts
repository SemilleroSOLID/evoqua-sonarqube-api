import { ProjectsGetter } from '@evoqua/types/api';
import { Project } from '@evoqua/types/models';

import { Component } from '../models';
import Base from './Base';

export default class ProjectsGetterImpl extends Base implements ProjectsGetter
{
  async getProjects(): Promise<Project[]> {
    const url = this.getEndpoint('/api/projects/search');
    const data = await this.request(url);
    return this.getProjectIdsFromResponse(data);
  }

  private getProjectIdsFromResponse(response: any): Project[] {
    return (response
      .components as Component[])
      .map(component => ({ key: component.key, name: component.name }));
  }
}
