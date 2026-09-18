import IpaMainLayout from './IpaMainLayout';

const IpaLayouts = {
  IpaMainLayout,
};

export default IpaLayouts;
export { IpaMainLayout };

// GlobalHeader and GlobalNav are deliberately NOT re-exported here. A barrel
// export is a static import, so every application that takes IpaMainLayout from
// this entry point would pull the chrome and ipa-ui's stylesheet with it,
// whatever its userConfig says, and that stylesheet sets rules on * and body.
//
// They have subpath exports of their own instead:
//
//   import GlobalHeader from '@invicara/ipa-core/GlobalHeader';
//
// which is also what InternalChrome imports, so naming one in a userConfig
// fetches it and nothing else does.
