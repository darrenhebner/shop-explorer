import {h} from '../../arvo';
import {Params} from '../types';

export async function CollectionList({shop}: Params, collections) {
  try {
    const data = await collections.read();

    return h`
      <ul>
        ${data.map(
          (collection) =>
            h`<li><a href="/${shop}/${collection.handle}">${collection.title}</a></li>`
        )}
      </ul>
    `;
  } catch (err) {
    return ``;
  }
}
