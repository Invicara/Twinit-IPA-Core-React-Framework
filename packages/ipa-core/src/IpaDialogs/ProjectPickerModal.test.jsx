import renderer from 'react-test-renderer';
import React from 'react';
import ProjectPickerModal from './ProjectPickerModal';
import {AppContext} from "../appContext";
import {createLegacyContextSupport} from "../test/util/legacyContext";
import PropTypes from "prop-types";


it('change la classe lorsqu\'on le survole', () => {

    const IfefProvider = createLegacyContextSupport({ ifefPlatform: PropTypes.object })
    const context = {ifefPlatform:{isAndroid:false}};
    const modal =  <IfefProvider context={context}>
        <ProjectPickerModal appContextProps={context}/>}
    </IfefProvider>;

    const component = renderer.create(modal);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});