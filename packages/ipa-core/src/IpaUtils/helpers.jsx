
import _ from 'lodash'

var getPlatform = function(platformOverride) {
  var isCordova = typeof Meteor !== 'undefined' && Meteor.isCordova;
  var iOS = {
    isIOS: true,
    isAndroid: false,
    isCordova: isCordova,
    transitionTimeOut: 450,
    name: 'iOS'
  };
  var android = {
    isIOS: false,
    isAndroid: true,
    isCordova: isCordova,
    transitionTimeOut: 320,
    name: 'Android'
  };

  // jl override to test various iOS components
  //if (platformOverride === 'iOS') { return iOS; }
  if (!platformOverride) { return iOS; }

  if (typeof cordova !== 'undefined' && cordova.platformId === 'ios') { return iOS; }

  if(!!navigator.userAgent.match(/iPad/i)
     || !!navigator.userAgent.match(/iPhone/i)
     || !!navigator.userAgent.match(/iPod/i)
    ) {
      return iOS;
  }

  if (platformOverride === 'Android') { return android; }

  if (typeof cordova !== 'undefined' && cordova.platformId === 'android') { return android; }

  if (navigator.userAgent.indexOf('Android') > 0) { return android; }

  return {
    isIOS: false,
    isAndroid: false,
    isCordova: isCordova,
    transitionTimeOut: 450,
    name: 'Web'
  };
};


function parseQuery(queryString) {
    const query = {};
    const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
  }


function getTitleBarInfoFromProps(pageName, props) {
  return {
    pageName,
    projectName: _.get(props, 'selectedItems.selectedProject._name', ""),
    switchProject: props.actions ? props.actions.reloadConfig : null,
    userName: props.user ? props.user._firstname + " " + props.user._lastname : "",
    logout: props.actions ? props.actions.userLogout : null
  }
}

const getRandomString = (prefix) => (prefix || "") + Math.random().toString(36).substring(2, 15)

const group = (assets, groupProperty, getPropertyValue) => {
  return assets.reduce((result, a) => {
    let groupName = getPropertyValue(a, groupProperty) || `${groupProperty} not set`
    let groupContents = result[groupName] || []
    groupContents.push(a)
    result[groupName] = groupContents
    return result
  }, {})
}

const nestedGroup = (values, keys, getPropertyValue) => {
  if (!keys.length) return values
  let [ groupKey, ...remainingKeys ] = keys
  let entries = Object.entries(group(values, groupKey, getPropertyValue))
  entries.sort((a,b) => {
    return a[0].localeCompare(b[0])
  })
  return entries.reduce( (result, [groupName, groupValues]) => {
      result[groupName] = nestedGroup(groupValues, remainingKeys, getPropertyValue)
      return result
    }, {})
}

const isValidUrl = (testString) => {
    
    let url = null
    try {
      url = new URL(testString)
    } catch(err) {
      return false
    }
    
    return url.protocol === 'http:' || url.protocol === 'https:'
    
  }

export {
  getPlatform,
  parseQuery,
  getTitleBarInfoFromProps,
  getRandomString,
  group,
  nestedGroup,
  isValidUrl
};
