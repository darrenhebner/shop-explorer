import {h} from '../../arvo';
import {Params} from '../types';

export async function Product(params: Params, product) {
  const {title, body_html, handle} = await product.read();

  return h`
    <h2>${title}</h2>
    ${body_html}
    <a class="view-product" href="https://${params.shop}/products/${handle}">View product</a>
  `;
}
