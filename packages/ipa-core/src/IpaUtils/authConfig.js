// Since Platform 5.2, new Twinit applications no longer get the "implicit" grant type,
// and the v1 OAuth endpoints are deprecated. Every application accepts "authorization_code"
// (PKCE), so it is the default. An app can still opt back into implicit by setting
// endPointConfig.authType = 'implicit', which only works on the v1 endpoints.
const AUTH_TYPES = ['pkce', 'implicit'];

export const getAuthType = () =>
  AUTH_TYPES.includes(endPointConfig.authType) ? endPointConfig.authType : 'pkce';

export const buildAuthServiceConfig = applicationId => {
  const authType = getAuthType();
  // v2 rejects "token" grants, so implicit has to stay on v1
  const apiVersion = authType === 'pkce' ? 'v2' : 'v1';
  const oauthBase = `${endPointConfig.passportServiceOrigin}/passportsvc/api/${apiVersion}/oauth`;

  return {
    clientId: endPointConfig.appId || applicationId,
    location: window.location,
    // v2 fails the login if the redirect URI has a trailing slash
    redirectUri: endPointConfig.baseRoot.replace(/\/+$/, ''),
    scopes: ['read write'],
    authorizeEndpoint: `${oauthBase}/authorize`,
    tokenEndpoint: `${oauthBase}/token`,
    authType,
    pkceVersion: authType === 'pkce' ? 'v5' : undefined,
    // also re-arm the refresh timer after a page reload, not only right after login
    autoRefresh: true,
  };
};
