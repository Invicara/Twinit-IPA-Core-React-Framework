
//import '@invicara/ipa-core/modules/styles/theme.scss';
//import '@invicara/ipa-core/modules/styles/icons.scss';
//using bootstrap to include normalize css
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/stories/assets/icons.scss';
import '../src/stories/assets/variables.scss';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}