import {h} from '../../arvo';

export async function Product(product) {
  const {title} = await product.read();

  return h`<h3>${title}</h3>`;
}
