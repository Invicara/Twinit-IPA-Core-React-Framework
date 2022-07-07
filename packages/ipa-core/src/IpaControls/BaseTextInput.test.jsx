import renderer from 'react-test-renderer';
import BaseTextInput from './BaseTextInput';
import React from 'react';

const homepageErrors = console.error.bind(console.error)
beforeAll(() => {
    console.error = errormessage => {
        /*
          if error is a proptype error and includes the following string: `Warning: Failed prop type:`
          suppress the error and don't show it
          if it is not a proptype error, we show it
        */
        const suppressedErrors = errormessage
            .toString()
            .includes("Warning: Failed prop type:")

        !suppressedErrors && homepageErrors(errormessage)
    }
})
afterAll(() => {
    console.error = homepageErrors
})


it('change la classe lorsqu\'on le survole', () => {
  const component = renderer.create(
    <BaseTextInput inputProps={{
        value: "",
        onChange: () => {console.log("pwett")},
        placeholder: "placeholder",
        className: "test-base-text-input",
        onFocusChange: () => {console.log("focus")},
    }}/>,
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});