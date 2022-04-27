---
id: upgrade-v1-to-v2
title: Upgrade from V1 to V2
sidebar_label: Upgrade from V1 to V2
slug: /upgrade-v1-to-v2
---

Support for [entity types](/docs/entity-types/) was added in version `2.0.0` of the JavaScript package, and corresponding changes were made to the `VitessceConfig` class and the associated constant values `Component`, `DataType`, `FileType`, and `CoordinationType`.

In v2 of the JS package, we export the v1 `VitessceConfig` class and the v1 constants to simplify the upgrade process. To make existing v1 code compatible with v2, modify existing import statements as follows:

```js
// Imports under v1
import {
    Vitessce,
    VitessceConfig,
    Component as cm,
    DataType as dt,
    FileType as ft,
    CoordinationType as ct,
    hconcat,
    vconcat,
} from 'vitessce';
```

should become

```js
// Imports under v2
import { Vitessce } from 'vitessce';
import {
    VitessceConfig,
    Component as cm,
    DataType as dt,
    FileType as ft,
    CoordinationType as ct,
    hconcat,
    vconcat,
} from 'vitessce/umd/production/v1';
```