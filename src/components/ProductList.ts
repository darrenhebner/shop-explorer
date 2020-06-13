import {h} from '../../arvo';
import {Params} from '../types.ts';

export async function ProductList({shop, collection}: Params, products) {
  const data = await products.read();

  return h`
    <h2>Products</h2>
    <ul>
      ${data.map(
        (product) =>
          h`<li><a href="/${shop}/${collection}/${product.handle}">${product.title}</a></li>`
      )}
    </ul>
  `;
}