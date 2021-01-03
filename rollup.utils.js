const html = require('@rollup/plugin-html');
const { makeHtmlAttributes }  = html;

function htmlFromTemplate({ attributes, files, publicPath }) {
  console.log(files.css);
  const scripts = (files.js || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.script);
      return `<script src="${publicPath}${fileName}"${attrs}></script>`;
    })
    .join('\n');

  const links = (files.css || [{ fileName: 'demo.css' }])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.link);
      return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html ${attributes}>
  <head>
    <meta charset="utf-8">

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-96954979-2"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', 'UA-96954979-2');
    </script>
    <style>
      html, body {
        height: 100%;
      }
      body {
        font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
        display: flex;
        flex-direction: column;
      }
      #full-app {
        flex: 1;
      }
      #full-app .vitessce-container {
        height: max(100%, 100vh);
        width: 100%;
        overflow: hidden;
      }
      #full-app #small-app .vitessce-container {
        height: 600px;
      }
    </style>
      
    <title>🚄  Vitessce</title>
    ${links}
  </head>
  <body>
    <div id="full-app">
      <div class="container-fluid">
        <div class="row p-2">
          <div class="col col-full" style="font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;">
            <!--
                This is a hack, so we can toggle between app and component, without adding more logic inside.
                If the url does not contain the "small" parameter, the content here will be replaced;
                If it does contain "small", the inner div will be filled instead.
            -->
            <a href="?">Vitessce</a> can either be a&nbsp;
            <script>
              const url = window.location.href.replace('small', '');
              document.write('<a href="' + url + '">full-window app</a>,')
            </script>
            &nbsp;or a component in a larger page:
            <div style="width: 1000px;">
               <div id="small-app"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    ${scripts}
  </body>
</html>`;
}

module.exports = {
    htmlFromTemplate,
};