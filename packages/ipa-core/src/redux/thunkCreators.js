import { showError } from './slices/globalError'
import _ from 'lodash'

const templateError = message => `There's nothing worse than a technical difficulty,
 but I'm afraid you've just encountered one${
     message ? ': ' + message : ''
 }. Please try refreshing the page, or try again in a few minutes.`
export const createFetcherThunk = (
    fetcher,
    requestActionCreator,
    successActionCreator,
    onSuccess,
    failureActionCreator,
) => (...fetchParams) => async dispatch => {
    requestActionCreator && dispatch(requestActionCreator(fetchParams))
    try {
        const fetchResult = await fetcher(...fetchParams)
        onSuccess && onSuccess(fetchResult)
        dispatch(successActionCreator(fetchResult))
    } catch (err) {
        failureActionCreator && dispatch(failureActionCreator(err))
        if (_.get(err, 'response.status') === 404) {
            //Redirect to the home page //TODO redirect to 404 page
            window.location = `${window.location.protocol}//${window.location.host}`
        } else {
            console.error(err)
            dispatch(showError(templateError(_.get(err, 'response.data.msg'))))
        }
    }
}
