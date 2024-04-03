
//Paths to various platform supplied pages

const PLATFORM_PATHS = {
    DOWNLOADS: endPointConfig.pluginBaseUrl + 'index.json',
    PLUGIN_BASE: endPointConfig.pluginBaseUrl,
    USER_ACCOUNT: endPointConfig.passportServiceOrigin + '/passportsvc/api/accounts'
}

export const getPlatformPath = (pathname, addPath) => {
    if (!pathname) return null
    else
        return PLATFORM_PATHS[pathname] + (addPath ? addPath : "")
}