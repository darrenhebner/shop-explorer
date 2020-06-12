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
    const response = await fetch(`https://${shop}/meta.json`);
    const {name, description} = await response.json();
    return {name, description};
  });

  const collections = createResource(async () => {
    const response = await fetch(`https://${shop}/collections.json`);
    const {collections} = await response.json();
    return collections;
  });

  const products = createResource(async () => {
    const response = await fetch(
      `https://${shop}/collections/${collection}/products.json`
    );

    const {products} = await response.json();
    return products;
  });

  const product = createResource(async () => {
    if (!productHandle) {
      return;
    }

    const response = await fetch(
      `https://${shop}/products/${productHandle}.json`
    );

    const {product} = await response.json();
    return product;
  });

  return h`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${shop}</title>
      </head>
      <body>
        <form name="searchform" method="POST">
          <input name="shop" value="${shop}" />
          <input type="submit" value="Search" onclick="searchform.action = '/' + searchform.shop.value"/>
        </form>

        ${shop ? Meta(meta) : ''}
        ${shop ? CollectionList(params, collections) : ''}
        ${collection ? ProductList(params, products) : ''}
        ${productHandle ? Product(product) : ''}
      </body>
    </html>
  `;
}

async function Meta(meta) {
  const {name, description} = await meta.read();

  return h`
    <h1>${name}</h1>
    <p>${description}</p>
  `;
}

async function CollectionList({shop}: Params, collections) {
  const data = await collections.read();

  return h`
    <ul>
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
    <ul>
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
