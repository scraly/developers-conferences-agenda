import React from 'react';
import { useTranslation } from 'contexts/LanguageContext';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="content">
        <p>
          {t('footer.createdBy')}{' '}
          <a
            href="https://x.com/aurelievache"
            target="_blank"
            rel="noopener noreferrer"
            className="footer"
          >
            Aurélie Vache
          </a>{' '}
          {t('footer.maintainedBy')}{' '}
          <a
            href="https://github.com/scraly/developers-conferences-agenda/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            className="footer"
          >
            {t('footer.community')}
          </a>{' '}
          {t('footer.withLove')}
        </p>
        <p>
          {t('footer.contribute')}{' '}
          <a
            href="https://github.com/scraly/developers-conferences-agenda/pulls"
            target="_blank"
            rel="noopener noreferrer"
            className="footer"
          >
            {t('footer.pullRequest')}
          </a>{' '}
          {t('footer.orAn')}{' '}
          <a
            href="https://github.com/scraly/developers-conferences-agenda/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="footer"
          >
            {t('footer.issue')}
          </a>{' '}
          {t('footer.toAddEvent')}.
        </p>
        <p>
          <a
            href="https://developers.events"
            target="_blank"
            rel="noopener noreferrer"
            className="footer"
          >
            developers.events
          </a>{' '}
          © 2017 - 2026 by Aurélie Vache {t('footer.licensedUnder')}{' '}
          <a
            href="https://opensource.org/license/mit"
            target="_blank"
            rel="noopener noreferrer"
            className="footer"
          >
            MIT
          </a>{' '}
          {t('footer.contentLicensedUnder')}{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer"
          >
            CC BY-NC 4.0
          </a>
          <img
            src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
            alt="CC"
            style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }}
          />
          <img
            src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
            alt="BY"
            style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }}
          />
          <img
            src="https://mirrors.creativecommons.org/presskit/icons/nc.svg"
            alt="NC"
            style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }}
          />
          .
        </p>
        <div style={{ marginTop: '1em', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <a
            className="footer"
            href="https://github.com/scraly/developers-conferences-agenda/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <svg
              height="24"
              width="24"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
              style={{ verticalAlign: 'middle' }}
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            <span style={{ marginLeft: '0.3em', fontSize: '1em' }}>
              scraly/developers-conferences-agenda/
            </span>
          </a>
        </div>
        <div className="footer-links">
          <div className="footer-link-lists">
            <ul>
              <li>
                📅{' '}
                <a
                  href="https://developers.events/all-events.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  {t('footer.fullEventsList')}
                </a>
              </li>
              <li>
                🗣️{' '}
                <a
                  href="https://developers.events/all-cfps.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  {t('footer.fullCfpsList')}
                </a>
              </li>
            </ul>
            <ul>
              <li>
                ⚛︎{' '}
                <a
                  href="https://developers.events/feed-events.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  {t('footer.atomFeed')}
                </a>
              </li>
              <li>
                {' { } '}
                <a
                  href="https://developers.events/feed-events.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  {t('footer.jsonFeed')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <section className="become-sponsor" aria-label={t('footer.becomeSponsorTitle')}>
          <p className="become-sponsor-title">{t('footer.becomeSponsorTitle')}</p>

          <p className="sponsors-list-title">{t('footer.thankYou')}</p>
          <div className="sponsors-grid">
            <a
              href="https://github.com/typesense"
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-card"
              title="Typesense"
            >
              <img
                src="https://avatars.githubusercontent.com/u/19822348?s=60&v=4"
                alt="Typesense"
                className="sponsor-avatar"
              />
              <span className="sponsor-name">Typesense</span>
            </a>
            <a
              href="https://github.com/Zenika"
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-card"
              title="Zenika"
            >
              <img
                src="https://avatars.githubusercontent.com/u/630230?s=60&v=4"
                alt="Zenika"
                className="sponsor-avatar"
              />
              <span className="sponsor-name">Zenika</span>
            </a>
          </div>

          <p className="become-sponsor-description">
            {t('footer.becomeSponsorDescription')}
          </p>

          <div className="become-sponsor-actions">
            <a
              href="https://github.com/sponsors/scraly"
              target="_blank"
              rel="noopener noreferrer"
              className="supportButton"
            >
              {t('footer.sponsor')}
            </a>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
