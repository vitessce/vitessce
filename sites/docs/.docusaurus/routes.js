import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug/',
    component: ComponentCreator('/__docusaurus/debug/', '48b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config/',
    component: ComponentCreator('/__docusaurus/debug/config/', '458'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content/',
    component: ComponentCreator('/__docusaurus/debug/content/', 'c05'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData/',
    component: ComponentCreator('/__docusaurus/debug/globalData/', 'a88'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata/',
    component: ComponentCreator('/__docusaurus/debug/metadata/', 'cf6'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry/',
    component: ComponentCreator('/__docusaurus/debug/registry/', '279'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes/',
    component: ComponentCreator('/__docusaurus/debug/routes/', 'ed9'),
    exact: true
  },
  {
    path: '/docs/',
    component: ComponentCreator('/docs/', '654'),
    routes: [
      {
        path: '/docs/',
        component: ComponentCreator('/docs/', '863'),
        exact: true,
        sidebar: "docs"
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'a42'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
