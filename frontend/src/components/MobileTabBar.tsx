"use client";

import Link from 'next/link';

interface MobileTabBarProps {
  active: 'feed' | 'discover' | 'notes' | 'profile';
}

const tabs = [
  { id: 'feed', label: 'Feed', href: '/' },
  { id: 'discover', label: 'Discover', href: '/feed' },
  { id: 'notes', label: 'Notes', href: '#' },
  { id: 'profile', label: 'Profile', href: '/profile' },
] as const;

export default function MobileTabBar({ active }: MobileTabBarProps) {
  return (
    <nav className="mobile-tabbar" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const isActive = tab.id === active;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`mobile-tabbar__item ${isActive ? 'is-active' : ''}`}
            onClick={(event) => {
              if (tab.href === '#') event.preventDefault();
            }}
          >
            <span className="mobile-tabbar__icon">{tab.label.slice(0, 1)}</span>
            <span className="mobile-tabbar__label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
