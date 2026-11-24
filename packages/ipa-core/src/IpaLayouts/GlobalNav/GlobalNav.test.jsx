import React from 'react';
import { render, screen } from '@testing-library/react';
import GlobalNav from './GlobalNav';

const internalPage = { path: '/navigator', title: 'Navigator', icon: '' };
const newTabPage = {
  path: '/equipdiag',
  title: 'Diagnostics',
  icon: '',
  newTab: true,
  newTabUrl: 'https://example.com/diag',
};

describe('GlobalNav', () => {
  it('routes ordinary pages through the hash', () => {
    render(<GlobalNav router={{ pageList: [internalPage] }} />);
    const link = screen.getByTitle('Navigator');
    expect(link.getAttribute('href')).toBe('#/navigator');
    expect(link.getAttribute('target')).toBeNull();
  });

  it('opens openNewTab handlers at their url in a new tab (DBM-4885)', () => {
    render(<GlobalNav router={{ pageList: [internalPage, newTabPage] }} />);
    const link = screen.getByTitle('Diagnostics');
    expect(link.getAttribute('href')).toBe('https://example.com/diag');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
  });

  it('opens openNewTab handlers in a new tab from a page group', () => {
    render(
      <GlobalNav
        router={{ pageGroups: [{ groupName: 'Tools', items: [internalPage, newTabPage] }] }}
      />
    );
    const link = screen.getByTitle('Diagnostics');
    expect(link.getAttribute('href')).toBe('https://example.com/diag');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(screen.getByTitle('Navigator').getAttribute('href')).toBe('#/navigator');
  });

  it('keeps the hash route when openNewTab has no url', () => {
    render(<GlobalNav router={{ pageList: [{ ...newTabPage, newTabUrl: null }] }} />);
    const link = screen.getByTitle('Diagnostics');
    expect(link.getAttribute('href')).toBe('#/equipdiag');
    expect(link.getAttribute('target')).toBeNull();
  });
});
