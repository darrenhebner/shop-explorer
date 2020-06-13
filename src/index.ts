import {h} from '../arvo';

interface Params {
  shop?: string;
  collection?: string;
  productHandle?: string;
}

export function App(pathname: string) {
  const [, shop, collection, productHandle] = pathname.split('/');

  const params: Params = {
    shop,
    collection,
    productHandle,
  };

  const meta = createResource(async () => {
    try {
      const response = await api(`https://${shop}/meta.json`);
      const {name, description} = await response.json();
      return {name, description};
    } catch (error) {
      return {
        name: 'No results found',
        description:
          'Try <a href="/misen.co">misen.co</a> or <a href="/buypeel.com">buypeel.com</a>',
      };
    }
  });

  const collections = createResource(async () => {
    const response = await api(`https://${shop}/collections.json`);
    const {collections} = await response.json();
    return collections;
  });

  const products = createResource(async () => {
    const response = await api(
      `https://${shop}/collections/${collection}/products.json`
    );

    const {products} = await response.json();
    return products;
  });

  const product = createResource(async () => {
    if (!productHandle) {
      return;
    }

    const allProducts = await products.read();
    return allProducts.find(({handle}) => handle === productHandle);
  });

  return h`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
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
            <input name="shop" type="url" value="${shop}" />
            <input type="submit" value="Search" onclick="searchform.action = '/' + searchform.shop.value"/>
          </form>
        </nav>

        ${shop ? Meta(meta) : ''}

        <main>
        ${shop ? CollectionList(params, collections) : ''}
        ${collection ? ProductList(params, products) : ''}
        ${productHandle ? Product(product) : ''}
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

async function Meta(meta) {
  const {name, description} = await meta.read();

  return h`
    <header>
      <h1>${name}</h1>
      <p>${description}</p>
    </header>
  `;
}

async function CollectionList({shop}: Params, collections) {
  const data = await collections.read();

  return h`
    <ul class="collections">
      ${data.map(
        (collection) =>
          h`<li><a href="/${shop}/${collection.handle}">${collection.title}</a></li>`
      )}
    </ul>
  `;
}

async function ProductList({shop, collection}: Params, products) {
  const data = await products.read();

  return h`
    <ul class="products">
      ${data.map(
        (product) =>
          h`<li><a href="/${shop}/${collection}/${product.handle}">${product.title}</a></li>`
      )}
    </ul>
  `;
}

async function Product(product) {
  const {title} = await product.read();

  return h`<h3>${title}</h3>`;
}

function createResource(fetcher) {
  const result = fetcher();

  return {
    read() {
      return result;
    },
  };
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
  ol[class],
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
  }

  ul,
  ol {
    list-style: none;
  }

  a {
    text-decoration-skip-ink: auto;
    color: inherit;
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
    --padding-small: 8px;
    --padding: 16px;
    --padding-large: 32px;
    --padding-x-large: 64px;

    --text-small: 12px;
    --text: 16px;
    --text-large: 32px;
    --text-x-large: 128px;

    --color-text: #1a202c;
    --color-background: white;
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
    display: flex;
    flex-direction: column;
  }

  nav {
    background: #2d3748;
    padding: var(--padding-small);
  }

  header {
    padding: var(--padding-small);
    border-bottom: 1px solid #cbd5e0;
  }

  main {
    display: flex;
    flex-grow: 1;
  }

  ul {
    margin: 0;
    padding: 0;
    border-right: 1px solid #cbd5e0;
  }

  li {
    border-bottom: 1px solid #cbd5e0;
    padding: var(--padding) var(--padding-small);
  }

  .collections {
    background: #e2e8f0;
  }

  .products {
    background: #edf2f7;
  }
`;
