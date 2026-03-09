import { OAuth2Token } from "./tokens";
export type TokenState = OAuth2Token | Record<string, unknown> | null;

export class HttpClient {
  oauth2Token: TokenState = null;

  refreshOAuth2(): void {
    this.oauth2Token = new OAuth2Token("fresh-token", 10 ** 10);
  }

  request(
    method: string,
    path: string,
    opts?: { api?: boolean; headers?: Record<string, string> }
  ): { method: string; path: string; headers: Record<string, string> } {
    const api = opts?.api ?? false;
    const headers = opts?.headers ?? {};

    if (api) {
      // ensure we have a fresh, real OAuth2Token before making API calls
      // refresh when there's no token, when the stored token isn't an OAuth2Token,
      // or when the existing OAuth2Token has expired.
      if (
        !this.oauth2Token ||
        !(this.oauth2Token instanceof OAuth2Token) ||
        (this.oauth2Token instanceof OAuth2Token && this.oauth2Token.expired)
      ) {
        this.refreshOAuth2();
      }

      // after the above check we either refreshed or already held a valid OAuth2Token
      if (this.oauth2Token instanceof OAuth2Token) {
        headers["Authorization"] = this.oauth2Token.asHeader();
      }
    }

    return { method, path, headers };
  }
}