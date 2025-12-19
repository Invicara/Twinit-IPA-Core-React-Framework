import MockAppProvider, {decorateWithMockAppProvider} from "./MockAppProvider";
import {createLegacyContextSupport} from './util/legacyContext'
import {AppProvider} from "./AppProvider";
import withAuthHoc from "./withAuthHoc";

const mocks = {
    MockAppProvider,
    decorateWithMockAppProvider,
    createLegacyContextSupport
};
export default mocks;
export {
    AppProvider,
    withAuthHoc,
    MockAppProvider,
    decorateWithMockAppProvider,
    createLegacyContextSupport
}
