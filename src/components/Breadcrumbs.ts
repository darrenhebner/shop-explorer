import {h} from '../../arvo';
import {Params} from '../types';

export async function Breadcrumbs({shop, collection}: Params, collections) {
  try {
    const data = await collections.read();

    const currentCollection = collection
      ? data.find(({handle}) => handle === collection)
      : undefined;

    return h`
      <ol class="breadcrumbs">
        <li>
          <a href="/${shop}">Collections</a>
        </li>
        ${
          currentCollection
            ? h`<li><a href="/${shop}/${currentCollection.handle}">${currentCollection.title}</a></li>`
            : ''
        }
      </ol>
    `;
  } catch (err) {
    return ``;
  }
}
