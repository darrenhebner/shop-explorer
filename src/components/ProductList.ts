import {h} from '../../arvo';
import {Params} from '../types';

export async function ProductList({shop, collection}: Params, products) {
  const data = await products.read();

  if (data.length === 0) {
    return h`<p>This collection is empty.</p>`;
  }

  return h`
    <ul>
      ${data.map(
        (product) =>
          h`<li><a href="/${shop}/${collection}/${product.handle}">${product.title}</a></li>`
      )}
    </ul>
  `;
}
