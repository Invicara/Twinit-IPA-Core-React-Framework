import MockAppProvider, {decorateWithMockAppProvider} from "./MockAppProvider";
import {createLegacyContextSupport} from './util/legacyContext'

const mocks = {
    MockAppProvider,
    decorateWithMockAppProvider,
    createLegacyContextSupport
};
export default mocks;
