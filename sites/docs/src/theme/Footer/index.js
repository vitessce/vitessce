/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { useThemeConfig } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import isInternalUrl from '@docusaurus/isInternalUrl';
import ThemedImage from '@theme/ThemedImage';
import IconExternalLink from '@theme/Icon/ExternalLink';
import { META_VERSION } from '@vitessce/constants-internal';
import styles from './styles.module.css';

// This component has been swizzled from docusaurus
// so that we can include the Vitessce version information.

function FooterLink({
  to, href, label, prependBaseUrlToHref, ...props
}) {
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, {
    forcePrependBaseUrl: true,
  });
  return (
    <Link
      className="footer__link-item"
      {...(href
        ? {
          href: prependBaseUrlToHref ? normalizedHref : href,
        }
        : {
          to: toUrl,
        })}
      {...props}
    >
      {href && !isInternalUrl(href) ? (
        <span>
          {label}
          <IconExternalLink />
        </span>
      ) : (
        label
      )}
    </Link>
  );
}

function FooterLogo({
  sources, alt, width, height,
}) {
  return (
    <ThemedImage
      className="footer__logo"
      alt={alt}
      sources={sources}
      width={width}
      height={height}
    />
  );
}

function Footer() {
  const { footer } = useThemeConfig();
  const { copyright, links = [], logo = {} } = footer || {};
  const sources = {
    light: useBaseUrl(logo.src),
    dark: useBaseUrl(logo.srcDark || logo.src),
  };

  if (!footer) {
    return null;
  }

  return (
    <footer
      className={clsx('footer', {
        'footer--dark': footer.style === 'dark',
      })}
    >
      <div className="container">
        {links && links.length > 0 && (
          <div className="row footer__links">
            {links.map((linkItem, i) => (
              <div key={i} className="col footer__col">
                {linkItem.title != null ? (
                  <div className="footer__title">{linkItem.title}</div>
                ) : null}
                {linkItem.items != null
                && Array.isArray(linkItem.items)
                && linkItem.items.length > 0 ? (
                  <ul className="footer__items">
                    {linkItem.items.map((item, key) => (item.html ? (
                      <li
                        key={key}
                        className="footer__item" // Developer provided the HTML, so assume it's safe.
                          // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{
                          __html: item.html,
                        }}
                      />
                    ) : (
                      <li key={item.href || item.to} className="footer__item">
                        <FooterLink {...item} />
                      </li>
                    )))}
                  </ul>
                  ) : null}
              </div>
            ))}
          </div>
        )}
        {(logo || copyright) && (
          <div className="footer__bottom text--center">
            {logo && (logo.src || logo.srcDark) && (
              <div className="margin-bottom--sm">
                {logo.href ? (
                  <Link
                    href={logo.href}
                    className={styles.footerLogoLink}
                    underline="none"
                    aria-label="Visit Vitessce home page"
                    target="_blank"
                    rel="noopener"
                  >
                    <FooterLogo
                      alt={logo.alt}
                      sources={sources}
                      width={logo.width}
                      height={logo.height}
                    />
                  </Link>
                ) : (
                  <FooterLogo alt={logo.alt} sources={sources} />
                )}
              </div>
            )}
            {copyright ? (
              <div className="footer__copyright">
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: copyright,
                  }}
                />
                <p className="info-section-text">
                  This deployment:&nbsp;
                  branch=<code>{META_VERSION.branch}</code>,&nbsp;
                  hash=<code>{META_VERSION.hash}</code>,&nbsp;
                  date={META_VERSION.date}

                  <br />
                  <span style={{ textAlign: 'left', display: 'inline-block', width: '60%', marginTop: '20px' }}>
                    Keller, M.S., Gold, I., McCallum, C., Manz, T., Kharchenko, P.V., Gehlenborg, N. Vitessce: integrative visualization of multimodal and spatially resolved single-cell data. <i>Nature Methods</i> (2024). https://doi.org/10.1038/s41592-024-02436-x
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;
