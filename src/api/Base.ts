export default abstract class Base {
  protected host: string;

  constructor(host: string) {
    this.host = host;
  }

  protected getEndpoint(url: string) {
    return new URL(url, this.host);
  }

  protected async request(url: URL) {
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  }

  async login(username: string, password: string) {
    const url = this.getEndpoint('/api/authentication/login');
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: new URLSearchParams({ login: username, password }),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
  }
}
