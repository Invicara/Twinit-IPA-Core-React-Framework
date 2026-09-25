import { buildAuthServiceConfig, getAuthType } from './authConfig';

describe('authConfig', () => {
  const original = { ...endPointConfig };

  afterEach(() => {
    Object.keys(endPointConfig).forEach(key => delete endPointConfig[key]);
    Object.assign(endPointConfig, original);
  });

  it('defaults to pkce on the v2 endpoints', () => {
    const config = buildAuthServiceConfig('app-id');
    expect(getAuthType()).toBe('pkce');
    expect(config.authType).toBe('pkce');
    expect(config.pkceVersion).toBe('v5');
    expect(config.authorizeEndpoint).toBe(
      'https://dt-dev.invicara.com/passportsvc/api/v2/oauth/authorize'
    );
    expect(config.tokenEndpoint).toBe('https://dt-dev.invicara.com/passportsvc/api/v2/oauth/token');
    expect(config.autoRefresh).toBe(true);
  });

  it('falls back to pkce for an unknown authType', () => {
    endPointConfig.authType = 'password';
    expect(buildAuthServiceConfig('app-id').authType).toBe('pkce');
  });

  it('keeps implicit on the v1 endpoints when an app opts in', () => {
    endPointConfig.authType = 'implicit';
    const config = buildAuthServiceConfig('app-id');
    expect(config.authType).toBe('implicit');
    expect(config.pkceVersion).toBeUndefined();
    expect(config.authorizeEndpoint).toBe(
      'https://dt-dev.invicara.com/passportsvc/api/v1/oauth/authorize'
    );
    expect(config.tokenEndpoint).toBe('https://dt-dev.invicara.com/passportsvc/api/v1/oauth/token');
  });

  it('strips trailing slashes from the redirect URI', () => {
    endPointConfig.baseRoot = 'http://localhost:8083/digitaltwin//';
    expect(buildAuthServiceConfig('app-id').redirectUri).toBe('http://localhost:8083/digitaltwin');
  });

  it('prefers endPointConfig.appId over the ipaConfig application id', () => {
    expect(buildAuthServiceConfig('app-id').clientId).toBe('app-id');
    endPointConfig.appId = 'config-app-id';
    expect(buildAuthServiceConfig('app-id').clientId).toBe('config-app-id');
  });
});
