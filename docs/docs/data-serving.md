---
id: data-serving
title: Serving Data
sidebar_label: Serving Data
slug: /data-serving
---

Vitessce is a "serverless" tool, and can read data hosted in object stores or static web servers, such as AWS S3.

## AWS S3

When using AWS S3, you will need to ensure that your bucket objects are readable by the outside world.
Configure the following in your bucket's `Permissions` tab.

### Block public access (bucket settings)

- Block all public access: off

### Bucket Policy

For a bucket named `foo-bar`, you will need to add the following in `Permissions` > `Bucket policy`:

```json
{
    "Version": "2012-10-17",
    "Id": "Policy12345",
    "Statement": [
        {
            "Sid": "Stmt6789",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::foo-bar/*"
        }
    ]
}
```

:::tip
Remember to change `foo-bar` to your bucket name in the "Resource" field.
:::

### Cross-origin resource sharing (CORS)

Add the following CORS configuration to the bucket to allow files to be read from other domains.

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "Content-Range"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

## Google Cloud

TODO

## GitHub Pages

Simply add your data files to the `gh-pages` branch of your repository, enable GitHub Pages in the repository settings tab, and add a `.nojekyll` file to the root of the `gh-pages` branch.

:::note
Zarr-based file types will not work on GitHub pages (GitHub does not serve hidden files, and Zarr attributes are stored in a hidden file called `.zattrs`). However, the JSON-based file types can be served from GitHub pages.
:::