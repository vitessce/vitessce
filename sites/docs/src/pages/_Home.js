// /* eslint-disable react/no-array-index-key */
// import React from 'react';
// import clsx from 'clsx';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import useBaseUrl from '@docusaurus/useBaseUrl';
// import { useColorMode } from '@docusaurus/theme-common';
// import styles from './styles.module.css';

// export default function Home() {
//   const { siteConfig = {} } = useDocusaurusContext();
//   const { colorMode } = useColorMode();
//   const isDarkTheme = (colorMode === 'dark');

//   const introUrl = useBaseUrl('/docs/platforms/');
//   const logoUrl = useBaseUrl(`/img/logo-vitessce-${(isDarkTheme ? 'dark' : 'light')}.png`);

//   return (
//     <>
//       <header className={clsx('hero hero--primary', styles.heroBanner)}>
//         <div className={clsx('container', styles.heroContainer)}>
//           <img className="hero__title" src={logoUrl} title="Vitessce" alt="Vitessce logo" />
//           <p className="hero__subtitle">{siteConfig.tagline}</p>
//         </div>
//       </header>
//       <main>
//         <section>
//           <div className={styles.container}>
//             <form className="form">
//               <label htmlFor="inputField">Enter your study id:</label>
//               <input type="text" id="inputField" className={styles.textBox} />
//               <button type="submit" className={styles.submitButton}>Submit</button>
//             </form>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }
