import {h} from '../../arvo';
import {Params} from '../types.ts';

export async function CollectionList({shop}: Params, collections) {
  const data = await collections.read();

  return h`
    <h2>Collections</h2>
    <ul>
      ${data.map(
        (collection) =>
          h`<li><a href="/${shop}/${collection.handle}">${collection.title}</a></li>`
      )}
    </ul>
  `;
}
