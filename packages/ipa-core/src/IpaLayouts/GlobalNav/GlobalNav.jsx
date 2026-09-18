import React, { useCallback, useEffect, useRef, useState } from 'react';
// classnames rather than clsx: ipa-core already depends on it, and the two
// have the same call signature here.
import clsx from 'classnames';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
// ipa-ui ships dist/output.css but its built entry never imports it, so the
// design tokens have to be pulled in explicitly. Component styles do arrive
// with the JS as injected CSS modules. webpack dedupes this across components.
import '@dtplatform/ipa-ui/dist/output.css';
import './GlobalNav.scss';

/**
 * The application's left navigation: a dark rail that overlays the layout and
 * widens on the burger or on hovering a section, with labels fading in and
 * groups expanding in place. Built from the Design System file's "Global
 * Header & Navigation" page, Menu Closed (4345:7512) and Menu Open
 * (4349:11568).
 *
 * ── Using it ──────────────────────────────────────────────────────────────
 *
 * An app selects a sidebar through userConfig `settings.sidebarComponent`,
 * which ipa-core resolves as `app/ipaCore/<value>.jsx`, falling back to the
 * components it ships when no such file exists. So the simplest use is to name
 * this one and write nothing:
 *
 *   "sidebarComponent": "GlobalNav"
 *
 * To wrap it, point the setting at a file of your own:
 *
 *   // app/ipaCore/components/GlobalNav.jsx
 *   import GlobalNav from '@invicara/ipa-core/GlobalNav';
 *   export default GlobalNav;
 *
 * GlobalHeader is chosen separately through `settings.headerComponent`, so an app
 * can take one of them without the other. Without this setting ipa-core
 * renders its own FlexLeftNavs and nothing here runs.
 *
 * ── What ipa-core passes in ───────────────────────────────────────────────
 *
 * contextProps are spread in and nothing else, so pages arrive under `router`,
 * the same source the default Layout reads:
 *
 *   router.pageGroups  [{ groupName, icon, items: [page] }]  when grouped
 *   router.pageList    [page]                                otherwise
 *   page               { path, key, title, icon, dontindex }
 *
 * Icons are whatever class userConfig names, from whichever set the app loads.
 * The stylesheet normalises the two that ship with ipa-core, a CSS-masked SVG
 * and an icon font, which are sized and coloured by different properties.
 */

/** ipa-core pages carry an icon class name (ionicon/fontawesome), not a node. */
const PageIcon = ({ icon }) =>
  icon ? <i className={icon} aria-hidden="true" /> : <CircleOutlinedIcon fontSize="small" />;

const isPageActive = (page, hash) => {
  if (!page?.path) return false;
  const current = (hash || '').replace(/^#/, '').split('?')[0];
  return new RegExp(`${page.path}(?:/|$)`).test(current);
};

const HOVER_CLOSE_DELAY_MS = 120;

const GlobalNav = ({ router, userConfig }) => {
  // Two ways in, kept apart on purpose. The burger pins the rail open until the
  // cross is clicked; hovering a section opens it only while the pointer stays.
  // The hover is on the section rows themselves rather than on the whole rail,
  // so crossing the left edge on the way somewhere else no longer expands it.
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash
  );

  const closeTimer = useRef(null);
  const expanded = pinned || hovered;

  // ipa-core routes on the hash, so the active item follows hashchange rather
  // than any router context this component cannot see.
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openOnHover = useCallback(() => {
    clearTimeout(closeTimer.current);
    setHovered(true);
  }, []);

  // A short delay on the way out keeps the rail open while the pointer crosses
  // the gap between a section and its sub-items.
  const closeOnLeave = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHovered(false), HOVER_CLOSE_DELAY_MS);
  }, []);

  const keepOpen = useCallback(() => clearTimeout(closeTimer.current), []);

  const toggleGroup = useCallback((groupName, isOpen) => {
    setOpenGroups(open => ({ ...open, [groupName]: !isOpen }));
  }, []);

  // Following a link navigates, so the rail has done its job and gets out of
  // the way. Group headers do not go through this: they only open their own
  // section, and closing the rail under that would undo the click.
  const goToPage = useCallback(
    page => event => {
      clearTimeout(closeTimer.current);
      setPinned(false);
      setHovered(false);
      if (page.onClick) page.onClick(event);
    },
    []
  );

  const renderRow = useCallback(
    page => {
      if (page?.dontindex) return null;
      const active = isPageActive(page, hash);
      return (
        <li key={page.path || page.key}>
          <a
            className={clsx('ipa-sidebar__row', active && 'ipa-sidebar__row--active')}
            href={page.path ? `#${page.path}` : undefined}
            onClick={goToPage(page)}
            onMouseEnter={openOnHover}
            title={page.title}
            aria-current={active ? 'page' : undefined}
          >
            <span className="ipa-sidebar__icon">
              <PageIcon icon={page.icon} />
            </span>
            <span className="ipa-sidebar__label">{page.title}</span>
          </a>
        </li>
      );
    },
    [hash, goToPage, openOnHover]
  );

  const renderSublink = useCallback(
    page => {
      if (page?.dontindex) return null;
      const active = isPageActive(page, hash);
      return (
        <li key={page.path || page.key}>
          <a
            className={clsx('ipa-sidebar__sublink', active && 'ipa-sidebar__sublink--active')}
            href={page.path ? `#${page.path}` : undefined}
            onClick={goToPage(page)}
            title={page.title}
            aria-current={active ? 'page' : undefined}
          >
            {page.title}
          </a>
        </li>
      );
    },
    [hash, goToPage]
  );

  const groups = (router?.pageGroups || []).filter(
    // Matches how AIA filters, so a group disabled in userConfig stays hidden.
    group => !userConfig?.groupedPages?.[group.groupName]?.disabled
  );
  const pages = router?.pageList || [];

  return (
    <nav
      className={clsx('ipa-sidebar', expanded && 'ipa-sidebar--expanded')}
      aria-label="Main navigation"
      data-testid="ipa-sidebar"
    >
      {/* The panel is what actually paints and animates; .ipa-sidebar stays a fixed
          48px slot in flow so expanding overlays the content instead of
          pushing it. */}
      <div className="ipa-sidebar__panel" onMouseEnter={keepOpen} onMouseLeave={closeOnLeave}>
        <button
          type="button"
          className="ipa-sidebar__toggle"
          onClick={() => {
            // The cross closes the rail whichever way it was opened, and the
            // burger pins it so it survives the pointer leaving.
            clearTimeout(closeTimer.current);
            setHovered(false);
            setPinned(!expanded);
          }}
          aria-label={expanded ? 'Close navigation' : 'Open navigation'}
          aria-expanded={expanded}
        >
          {expanded ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div className="ipa-sidebar__inner">
          {groups.length > 0 ? (
            <ul className="ipa-sidebar__list">
              {groups.map(group => {
                // The design marks the group holding the current page, not just
                // the sub-item, and shows that group open. Until it is toggled
                // by hand, its own state follows the route.
                const active = (group.items || []).some(page => isPageActive(page, hash));
                const open = openGroups[group.groupName] ?? active;
                return (
                  <li key={group.groupName}>
                    <button
                      type="button"
                      className={clsx('ipa-sidebar__row', active && 'ipa-sidebar__row--active')}
                      onClick={() => toggleGroup(group.groupName, open)}
                      onMouseEnter={openOnHover}
                      aria-expanded={open}
                      title={group.groupName}
                    >
                      <span className="ipa-sidebar__icon">
                        <PageIcon icon={group.icon} />
                      </span>
                      <span className="ipa-sidebar__label">{group.groupName}</span>
                      <span
                        className={clsx(
                          'ipa-sidebar__chevron',
                          open && 'ipa-sidebar__chevron--open'
                        )}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </span>
                    </button>

                    {/* Always mounted, so opening and closing can animate. The
                        wrapper collapses it to nothing, and the list itself
                        goes visibility: hidden once closed, which also takes
                        its links out of the tab order. */}
                    <div
                      className={clsx('ipa-sidebar__subwrap', open && 'ipa-sidebar__subwrap--open')}
                    >
                      <ul className="ipa-sidebar__sublist">
                        {(group.items || []).map(renderSublink)}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="ipa-sidebar__list">{pages.map(renderRow)}</ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default GlobalNav;
