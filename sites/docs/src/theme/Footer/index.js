/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { useThemeConfig } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import { META_VERSION } from '@vitessce/constants-internal';
import styles from './styles.module.css';

// This component has been swizzled from docusaurus
// so that we can include the Vitessce version information
// and a modern custom footer layout.

function FooterLink({
  to, href, label, prependBaseUrlToHref, ...props
}) {
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, {
    forcePrependBaseUrl: true,
  });
  return (
    <Link
      className={styles.footerLink}
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

function Footer() {
  const { footer } = useThemeConfig();
  const { links = [] } = footer || {};

  if (!footer) {
    return null;
  }

  // Extract Ecosystem and Built with sections from config
  const ecosystemLinks = links.find((l) => l.title === 'Ecosystem');
  const builtWithLinks = links.find((l) => l.title === 'Built with');

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/* Top row: link columns + citation */}
        <div className={styles.footerTop}>
          {/* Link columns */}
          <div className={styles.footerColumns}>
            {ecosystemLinks && (
              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>{ecosystemLinks.title}</h4>
                <ul className={styles.footerColumnList}>
                  {ecosystemLinks.items.map((item, i) => (
                    <li key={i}>
                      <FooterLink {...item} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {builtWithLinks && (
              <div className={styles.footerColumn}>
                <h4 className={styles.footerColumnTitle}>{builtWithLinks.title}</h4>
                <ul className={styles.footerColumnList}>
                  {builtWithLinks.items.map((item, i) => (
                    <li key={i}>
                      <FooterLink {...item} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Info cards: citation + contact */}
          <div className={styles.footerInfoCards}>
            <div className={styles.footerInfoCard}>
              <span className={styles.footerInfoLabel}>How to cite: </span>
              Keller, M.S., Gold, I., McCallum, C., Manz, T., Kharchenko, P.V., Gehlenborg, N.
              Vitessce: integrative visualization of multimodal and spatially resolved single-cell
              data. <i>Nature Methods</i> 22, 63&ndash;67 (2025).{' '}
              <a
                href="https://doi.org/10.1038/s41592-024-02436-x"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerInfoLink}
              >
                https://doi.org/10.1038/s41592-024-02436-x
              </a>
            </div>
            <div className={styles.footerInfoCard}>
              <span className={styles.footerInfoLabel}>How to contact: </span>
              Email{' '}
              <a href="mailto:hidive@hms.harvard.edu?subject=Vitessce%20Inquiry" className={styles.footerInfoLink}>
                hidive@hms.harvard.edu
              </a>{' '}
              or provide feedback via{' '}
              <a
                href="https://github.com/vitessce/vitessce/issues"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerInfoLink}
              >
                issues
              </a>{' '}
              (for bug reports or feature requests) and{' '}
              <a
                href="https://github.com/vitessce/vitessce/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerInfoLink}
              >
                discussions
              </a>{' '}
              on GitHub.
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.footerDivider} />

        {/* Bottom row: copyright + deployment info */}
        <div className={styles.footerBottom}>
          <p className={styles.footerCopyright}>
            Copyright &copy; 2026{' '}
            <a href="http://hidivelab.org/" target="_blank" rel="noopener noreferrer">
              HIDIVE Lab
            </a>{' '}
            @ Harvard Medical School. Vitessce is open source and MIT licensed. Vitessce
            documentation is CC BY 4.0 licensed.
          </p>
          <p className={styles.footerDeploy}>
            branch=<code>{META_VERSION.branch}</code>&ensp;
            hash=<code>{META_VERSION.hash}</code>&ensp;
            date={META_VERSION.date}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
