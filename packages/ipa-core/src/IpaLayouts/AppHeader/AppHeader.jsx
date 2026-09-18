import React, { useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@dtplatform/ipa-ui';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
// ipa-ui ships dist/output.css but its built entry never imports it, so the
// design tokens have to be pulled in explicitly. Component styles do arrive
// with the JS as injected CSS. A host that also imports output.css ends up
// with it twice, which is harmless: it is the same set of custom properties.
import '@dtplatform/ipa-ui/dist/output.css';
import darkLogo from '../../img/invicara-logo.svg';
import './AppHeader.scss';

/**
 * The application header: logo, app name, project, and the account menu.
 * Built from the Design System file's "Global Header & Navigation" page, where
 * the bar is 1392x56 at x=48 (beside the rail) and the account panel follows
 * info-dropDown-block at 254px wide.
 *
 * ── Using it ──────────────────────────────────────────────────────────────
 *
 * An app selects a header through userConfig `settings.headerComponent`, which
 * ipa-core resolves as `app/ipaCore/<value>.jsx`. So a host always points that
 * setting at one of its own files, and that file either re-exports this
 * component unchanged or wraps it to add its own pieces:
 *
 *   // app/ipaCore/components/AppHeader.jsx
 *   import { AppHeader } from '@invicara/ipa-core/modules/IpaLayouts';
 *   export default AppHeader;                       // vanilla
 *
 *   // or composed
 *   export default props => (
 *     <AppHeader
 *       {...props}
 *       slots={{
 *         actions: <NotificationTray />,
 *         menuItems: [
 *           { key: 'workspace', caption: 'Workspace', label: name, onSelect: pick },
 *         ],
 *       }}
 *     />
 *   );
 *
 * AppSidebar is chosen separately through `settings.sidebarComponent`, so an
 * app can take one of them without the other.
 *
 * ── What a host can add ───────────────────────────────────────────────────
 *
 * All of it hangs off one `slots` prop:
 *
 *   actions     a node placed in the toolbar, before the account cluster. The
 *               notification tray goes here.
 *   menuItems   extra account-menu rows, appended after the built-in ones and
 *               before Log out, which the design keeps last on its own. Each is
 *               { key, label, caption?, icon?, onSelect, danger? }. Plain data
 *               rather than nodes, so it can be built from config.
 *   logo        a node replacing the logo entirely, for a host whose branding
 *               does not come from userConfig `settings.appImage`.
 *
 * They are namespaced rather than taken as plain props because TitleBar spreads
 * contextProps into this component flat, and contextProps is {...AppProvider
 * .state} — a namespace this component does not own and cannot predict. It
 * already carries `actions`, an object of a dozen bound action creators, so an
 * `actions` prop here silently captured it and threw on the first render. Any
 * other flat name is free only by luck, and only until AppProvider gains a
 * state key with that name.
 *
 * Anything beyond these is a sign the host wants its own header, which the
 * userConfig indirection already allows: write the component and name it.
 *
 * ── What ipa-core passes in ───────────────────────────────────────────────
 *
 * contextProps are spread flat, plus these five:
 *
 *   titleInfo       { pageName, projectName, userName, switchProject, logout }
 *   switchProj      click handler, preventDefault + titleInfo.switchProject()
 *   goToUserAccount click handler for the platform account page
 *   userLogout      logout action
 *   logoComponent   ipa-core's Logo, which resolves the configured appImage
 *
 * The design also shows a "Manage user group" entry and a Workspace row.
 * Neither is built in: ipa-core hands this component no action for either, and
 * a row with a chevron that goes nowhere is worse than its absence. A host that
 * does have those actions adds them through `menuItems`.
 */

/**
 * ipa-core's Logo falls back to a hardcoded invicara-logo_white.svg whenever
 * `settings.appImage` carries neither a url nor a filename. This header is
 * light, so a white wordmark would disappear on it, and the dark colourway is
 * used instead. A deployment that configures appImage still gets its own.
 */
const CONFIGURED = image => !!(image && (image.url || image.filename));

/** The design shows initials in the avatar. */
const initialsOf = name => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/** A panel row: an optional caption above the label, and a trailing chevron. */
const MenuRow = ({ caption, label, icon }) => (
  <span className="ipa-header__menu-row">
    <span className="ipa-header__menu-row-label">
      {caption ? <span className="ipa-header__menu-row-caption">{caption}</span> : null}
      <span className={caption ? 'ipa-header__menu-row-value' : undefined}>{label}</span>
    </span>
    <span className="ipa-header__menu-row-chevron">
      {icon || <ChevronRightIcon fontSize="small" />}
    </span>
  </span>
);

/** A row that reads as a warning: leading icon, the alert colour. */
const DangerRow = ({ label, icon }) => (
  <span className="ipa-header__menu-row ipa-header__menu-row--danger">
    <span className="ipa-header__menu-row-chevron">{icon || <LogoutIcon fontSize="small" />}</span>
    <span>{label}</span>
  </span>
);

const AppHeader = ({
  titleInfo,
  switchProj,
  goToUserAccount,
  userLogout,
  logoComponent: Logo,
  userConfig,
  selectedItems,
  user,
  slots,
}) => {
  // Not destructured in the signature: see the note above on why these are
  // namespaced rather than read straight off props.
  const { actions, menuItems, logo } = slots || {};
  const [menuOpen, setMenuOpen] = useState(false);

  const projectName = titleInfo?.projectName || '';
  const userName = titleInfo?.userName?.trim() || '';
  const email = user?._email || '';
  const appName = userConfig?.settings?.appName || '';
  const initials = initialsOf(userName);

  // version.js is written at deploy time and read as a global; it is absent in
  // local dev, hence the typeof guard rather than optional chaining on an
  // undeclared identifier.
  const appVersion = typeof version !== 'undefined' ? version?.version : undefined;

  return (
    <header className="ipa-header" data-testid="ipa-header">
      <div className="ipa-header__brand">
        <div className="ipa-header__logo">
          {logo ||
            (Logo && CONFIGURED(userConfig?.settings?.appImage) ? (
              /* appName is deliberately empty: ipa-core's Logo would render it
                 at 25px, and the design puts it after a rule at 14/700. */
              <Logo homepage="#/" appName="" contextProps={{ userConfig, selectedItems }} />
            ) : (
              <a href="#/">
                <img src={darkLogo} alt="Invicara" />
              </a>
            ))}
        </div>

        {appName || projectName ? (
          <span className="ipa-header__divider" aria-hidden="true" />
        ) : null}

        {appName ? <span className="ipa-header__app-title">{appName}</span> : null}

        {projectName ? (
          <span className="ipa-header__project" title={projectName}>
            {projectName}
          </span>
        ) : null}
      </div>

      <div className="ipa-header__toolbar">
        {actions ? <div className="ipa-header__actions">{actions}</div> : null}

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="tertiary" size="sm" aria-label="Account menu">
              <span className="ipa-header__account">
                <span className="ipa-header__avatar" aria-hidden="true">
                  {initials}
                </span>
                {userName ? <span className="ipa-header__account-name">{userName}</span> : null}
                <span
                  className={`ipa-header__chevron${menuOpen ? ' ipa-header__chevron--open' : ''}`}
                >
                  <ExpandMoreIcon fontSize="small" />
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="ipa-header__menu">
            {userName || email ? (
              <div className="ipa-header__menu-header">
                {userName ? <span className="ipa-header__menu-name">{userName}</span> : null}
                {email ? <span className="ipa-header__menu-email">{email}</span> : null}
              </div>
            ) : null}

            {goToUserAccount ? (
              <DropdownMenuItem onSelect={goToUserAccount}>
                <MenuRow label="My profile" />
              </DropdownMenuItem>
            ) : null}

            {switchProj ? (
              <DropdownMenuItem onSelect={switchProj}>
                {/* The design shows the current project under the action, so
                    the row says where you are as well as what it does. */}
                <MenuRow caption="Switch project" label={projectName || 'Switch project'} />
              </DropdownMenuItem>
            ) : null}

            {/* The host's rows sit with the built-in ones and are styled the
                same way, so an app cannot end up with a menu that looks
                assembled from two different designs. */}
            {(menuItems || []).map(item => (
              <DropdownMenuItem key={item.key} onSelect={item.onSelect}>
                {item.danger ? (
                  <DangerRow label={item.label} icon={item.icon} />
                ) : (
                  <MenuRow caption={item.caption} label={item.label} icon={item.icon} />
                )}
              </DropdownMenuItem>
            ))}

            {userLogout ? (
              <DropdownMenuItem onSelect={userLogout}>
                <DangerRow label="Log out" />
              </DropdownMenuItem>
            ) : null}

            {appVersion ? <div className="ipa-header__menu-version">{appVersion}</div> : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
