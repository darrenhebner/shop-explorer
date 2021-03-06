import {h, createResource} from '../arvo';
import {Params} from './types';
import {
  Meta,
  ProductList,
  CollectionList,
  Product,
  Breadcrumbs,
} from './components';

import {NoResultError, MissingParamsError} from './errors';

export function App(pathname: string) {
  const [, shop, collection, productHandle] = pathname.split('/');

  const params: Params = {
    shop,
    collection,
    productHandle,
  };

  const meta = createResource(async () => {
    if (!shop) {
      throw new MissingParamsError();
    }

    try {
      const response = await api(`https://${shop}/meta.json`);
      const {name, description, url} = await response.json();
      return {name, description, url};
    } catch (error) {
      throw new NoResultError();
    }
  });

  const collections = createResource(async () => {
    if (!shop) {
      throw new MissingParamsError();
    }

    try {
      const response = await api(`https://${shop}/collections.json`);
      const {collections} = await response.json();
      return collections;
    } catch (err) {
      throw new NoResultError();
    }
  });

  const products = createResource(async () => {
    if (!shop || !collection) {
      return;
    }

    try {
      const response = await api(
        `https://${shop}/collections/${collection}/products.json`
      );

      const {products} = await response.json();
      return products;
    } catch (err) {
      throw new NoResultError();
    }
  });

  const product = createResource(async () => {
    if (!productHandle) {
      return;
    }

    try {
      const allProducts = await products.read();
      return allProducts.find(({handle}) => handle === productHandle);
    } catch (err) {
      throw new NoResultError();
    }
  });

  function children() {
    switch (true) {
      case productHandle && productHandle.length > 0: {
        return Product(params, product);
      }
      case collection && collection.length > 0: {
        return ProductList(params, products);
      }
      case shop && shop.length > 0: {
        return CollectionList(params, collections);
      }
      default: {
        return `<p></p>`;
      }
    }
  }

  return h`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✌️</text></svg>">
        <title>${shop}</title>
        <style>
          ${reset}
          ${variables}
          ${styles}
        </style>
      </head>
      <body>
        <nav>
          <form novalidate name="searchform" method="POST">
            <input type="search" list="suggestions" name="shop" placeholder="Enter a shop url…" />

            <datalist id="suggestions">
              <option value="misen.co">
              <option value="buypeel.com">
              <option value="uturnaudio.com">
              <option value="whatsupton.com">
            </datalist>

            <input type="submit" value="Search" onclick="searchform.action = '/' + searchform.shop.value"/>
          </form>
        </nav>

        ${Meta(meta)}

        <main>
        ${Breadcrumbs(params, collections)}
        ${children()}
        </main>

        <script>
          (function () {
            navigator.serviceWorker.register('/sw.js')
          })();
        </script>
      </body>
    </html>
  `;
}

function api(path: string) {
  if (typeof navigator !== 'undefined' && 'storage' in navigator) {
    return caches.open('v1').then(function(cache) {
      return cache.match(path).then(function(response) {
        return (
          response ||
          fetch(path).then(function(response) {
            cache.put(path, response.clone());
            return response;
          })
        );
      });
    });
  }

  return fetch(path);
}

const reset = `
  /* Box sizing rules */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Remove default padding */
  ul[class],
  ol[class] {
    padding: 0;
  }

  /* Remove default margin */
  body,
  h1,
  h2,
  h3,
  h4,
  p,
  ul[class],
  li,
  figure,
  figcaption,
  blockquote,
  dl,
  dd {
    margin: 0;
  }

  /* Set core body defaults */
  body {
    min-height: 100vh;
    scroll-behavior: smooth;
    text-rendering: optimizeSpeed;
    line-height: 1.5;
    touch-action: manipulation;
    -webkit-tap-highlight-color;
    -webkit-touch-callout;
  }

  ul,
  ol {
    list-style: none;
  }

  a {
    text-decoration-skip-ink: auto;
    text-decoration: none;
  }

  /* Make images easier to work with */
  img {
    max-width: 100%;
    display: block;
  }

  /* Natural flow and rhythm in articles by default */
  article > * + * {
    margin-top: 1em;
  }

  /* Inherit fonts for inputs and buttons */
  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  form {
    margin: 0;
  }
`;

const variables = `
  :root {
    --padding-x-small: 4px;
    --padding-small: 8px;
    --padding: 16px;
    --padding-large: 32px;
    --padding-x-large: 64px;

    --text-x-small: 12px;
    --text-small: 14px;
    --text: 16px;
    --text-large: 32px;
    --text-x-large: 128px;

    --color-text: black;
    --color-background: white;
    --color-grey: rgba(0, 0, 0, 0.6);
  }
`;

const styles = `
  html {
    color: var(--color-text);
    background: var(--color-background);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    max-width: 500px;
    margin: 0 auto;
    padding: 0 var(--padding) var(--padding-x-large);
  }

  nav form {
    margin-top: var(--padding);
    display: flex;
  }

  input[type="search"] {
    font-size: var(--text-small);
    flex-grow: 1;
    background: #eeeeee;
    border: 1px solid #eeeeee;
    border-radius: 3px;
    padding: var(--padding-x-small) var(--padding-small);
    -webkit-appearance: none;
  }

  input[type="submit"] {
    background: none;
    font-size: var(--text-small);
    color: #4299E1;
    border: none;
    padding: var(--padding-small);
  }

  header {
    padding: var(--padding) 0 var(--padding-small) 0;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    border-bottom: 1px solid #eeeeee;
    padding: var(--padding) 0;
  }

  a {
    color: #4299E1;
  }

  .cta {
    display: block;
    background: var(--color-text);
    color: var(--color-background);
    text-align: center;
    padding: var(--padding-small);
    margin: var(--padding-large) 0;
    border-radius: 5px;
  }

  .view-product {
    display: inline-block;
    background: var(--color-background);
    text-align: center;
    padding: var(--padding-small);
    margin: var(--padding-large) 0;
    border-radius: 5px;
    border: 1px solid #4299E1;
    font-size: var(--text-small);
  }

  h1, h2 {
    font-weight: bold;
  }

  h1 {
    font-size: var(--text-large);
  }

  h2 {
    font-size: var(--text);
    margin-bottom: var(--padding);
  }

  p {
    font-size: var(--text-small);
  }

  .breadcrumbs {
    display: flex;
    align-items: center;
    margin: 0 0 var(--padding) 0;
  }

  .breadcrumbs li {
    border: none;
    padding: 0;
  }

  .breadcrumbs li:not(:last-child):after {
    content: '›';
    color: rgba(0, 0, 0, 0.4);
    margin: 0 var(--padding-x-small);
  }

  .breadcrumbs li a {
    text-transform: uppercase;
    font-size: var(--text-x-small);
    color: var(--color-grey);
  }

  .breadcrumbs li:last-child {
    font-weight: bold;
  }
`;
