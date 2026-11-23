import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Globe, Youtube } from 'lucide-react';

import './RecordingLink.css';

const FALLBACK_LABEL = 'Watch recording';
const YOUTUBE_HOSTS = ['youtube.com', 'm.youtube.com', 'youtu.be'];
const MENU_GAP = 8;
const MENU_MARGIN = 8;
const MENU_WIDTH = 330;
const MOBILE_MENU_QUERY = '(max-width: 480px)';

const getEntries = (recordings, recording) => {
  if (recordings && recordings.length > 0) return recordings;
  return recording ? [{ label: '', url: recording }] : [];
};

const getPlatform = (url) => {
  try {
    const { hostname, search } = new URL(url);
    const host = hostname.replace(/^www\./, '');
    if (YOUTUBE_HOSTS.includes(host)) {
      return { host: 'youtube.com', kind: search.includes('list=') ? 'playlist' : 'video', youtube: true };
    }
    return { host, kind: '', youtube: false };
  } catch {
    return { host: '', kind: '', youtube: false };
  }
};

// The popup is portalled to the body so a scrollable container, such as the
// Leaflet popup, cannot clip it. Position it next to its trigger.
const getMenuPosition = (trigger) => {
  if (!trigger || window.matchMedia(MOBILE_MENU_QUERY).matches) return undefined;

  const rect = trigger.getBoundingClientRect();
  const width = Math.min(MENU_WIDTH, window.innerWidth - MENU_MARGIN * 2);
  const right = Math.max(
    MENU_MARGIN,
    Math.min(window.innerWidth - rect.right, window.innerWidth - width - MENU_MARGIN)
  );
  const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP - MENU_MARGIN;
  const spaceAbove = rect.top - MENU_GAP - MENU_MARGIN;
  const opensAbove = spaceBelow < 240 && spaceAbove > spaceBelow;
  const maxHeight = Math.max(120, opensAbove ? spaceAbove : spaceBelow);

  return opensAbove
    ? { right, bottom: window.innerHeight - rect.top + MENU_GAP, maxHeight }
    : { right, top: rect.bottom + MENU_GAP, maxHeight };
};

const RecordingLink = ({ recordings, recording, eventName }) => {
  const entries = getEntries(recordings, recording);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState();
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => setMenuPosition(getMenuPosition(triggerRef.current));
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    // Do not let focus scroll the page or a Leaflet container. The scroll
    // handler would interpret that focus-induced scroll as a reason to close.
    menuRef.current?.querySelector('.rec-item')?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      const items = Array.from(menuRef.current?.querySelectorAll('.rec-item') || []);
      if (items.length === 0) return;
      event.preventDefault();
      const index = items.indexOf(document.activeElement);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      items[(index + step + items.length) % items.length].focus();
    };
    const handlePointerDown = (event) => {
      if (wrapRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    // A fixed popup would no longer point at its trigger if an ancestor scrolls.
    // A phone bottom sheet stays viewport-anchored, so it has no such dependency.
    // This also ignores the scroll events Leaflet emits when the menu takes focus.
    const handleScroll = (event) => {
      if (window.matchMedia(MOBILE_MENU_QUERY).matches) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  if (entries.length === 0) return null;

  if (entries.length === 1) {
    const [only] = entries;
    const label = only.label || FALLBACK_LABEL;
    return (
      <a
        aria-label={label}
        className="recording-link"
        href={only.url}
        rel="noopener noreferrer"
        target="_blank"
        title={label}
      >
        <Youtube aria-hidden="true" size={16} />
      </a>
    );
  }

  const menuLabel = eventName ? `Recordings for ${eventName}` : 'Recordings';
  const menu = (
    <div aria-label={menuLabel} className="rec-menu" ref={menuRef} role="dialog" style={menuPosition}>
      <div className="rec-menu-head">
        <span>Recordings <span className="rec-menu-count">· {entries.length}</span></span>
        {eventName ? <span className="event-name">{eventName}</span> : null}
      </div>
      <div className="rec-list">
        {entries.map((entry, index) => {
          const platform = getPlatform(entry.url);
          return (
            <a
              className="rec-item"
              href={entry.url}
              key={`${entry.url}-${index}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {platform.youtube ? (
                <Youtube aria-hidden="true" className="platform" size={18} />
              ) : (
                <Globe aria-hidden="true" className="platform other" size={18} />
              )}
              <span className="rec-copy">
                <span className="rec-label">{entry.label || FALLBACK_LABEL}</span>
                <span className="rec-host">
                  {platform.kind ? `${platform.host} · ${platform.kind}` : platform.host}
                </span>
              </span>
              <ExternalLink aria-hidden="true" className="ext" size={14} />
            </a>
          );
        })}
      </div>
    </div>
  );

  return (
    <span className="rec-wrap" ref={wrapRef}>
      <a
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${entries.length} recordings${eventName ? ` for ${eventName}` : ''}`}
        className="rec-trigger"
        href={entries[0].url}
        onClick={(event) => {
          event.preventDefault();
          setOpen((value) => !value);
        }}
        ref={triggerRef}
        rel="noopener noreferrer"
        role="button"
        target="_blank"
        title={`${entries.length} recordings`}
      >
        <Youtube aria-hidden="true" size={18} />
        <span className="badge">{entries.length}</span>
      </a>
      {open ? createPortal(menu, document.body) : null}
    </span>
  );
};

export default RecordingLink;
