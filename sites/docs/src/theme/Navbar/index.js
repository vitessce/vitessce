import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import logo from '../../static/img/logo-v.png';

function Navbar() {

  const navbarItemsBasic = [
    {
      href: '/#?edit=true',
      label: 'App',
      position: 'left',
    },
    {
      to: 'examples',
      label: 'Examples',
      position: 'left',
    },
    {
      type: 'doc',
      docId: 'introduction',
      label: 'Docs',
      position: 'left',
    },
    {
      type: 'doc',
      docId: 'tutorials',
      label: 'Tutorials',
      position: 'left',
    },
    {
      href: 'https://vitessce.github.io/vitessce-python/',
      label: 'For Python',
      position: 'left',
    },
    {
      href: 'https://vitessce.github.io/vitessceR/',
      label: 'For R',
      position: 'left',
    },
    {
      type: 'doc',
      docId: 'feedback',
      label: 'Feedback',
      position: 'right',
    },
    {
      to: 'blog',
      label: 'Blog',
      position: 'right',
    },
    {
      href: 'http://ipa-reader.xyz/?text=v%C9%AAt-%C9%9Bs',
      position: 'right',
      className: 'header-pronunciation-link',
      'aria-label': 'Pronunciation',
    },
    {
      href: 'https://github.com/vitessce/',
      position: 'right',
      className: 'header-github-link',
      'aria-label': 'GitHub repository',
    },
  ];
  
  const navbarItemsExpanded = [
    {
      href: '/#?edit=true',
      label: 'Exit full screen mode',
      position: 'right',
    },
  ];
  
  const [isExpanded, setIsExpanded] = useState(false);

  const itemsToDisplay = isExpanded ? navbarItemsExpanded : navbarItemsBasic;

  return (
    <nav>
    <p>Hello, world!</p>
      <a href={logo.href}>
        <img src={logo.src} alt={logo.alt} />
      </a>
      {itemsToDisplay.map(item => (
          <Link key={item.label} to={item.to} href={item.href}>
              {item.label}
          </Link>
      ))}
      <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Collapse' : 'Expand'}
      </button>
  </nav>
  );
}

export default Navbar;