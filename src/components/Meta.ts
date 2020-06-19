import {h} from '../../arvo';
import {NoResultError, MissingParamsError} from '../errors';

export async function Meta(meta) {
  try {
    const {name, description, url} = await meta.read();

    return h`
      <header>
        <h1>${name}</h1>
        <p>${description}</p>

        ${url ? h`<a class="cta" href="${url}">Visit shop</a>` : ''}
      </header>
    `;
  } catch (err) {
    switch (err.constructor) {
      case NoResultError: {
        return h`
          <header>
            <h1>No results found</h1>
            <p>Try searching for <a href="misen.co">misen.co</a> or <a href="buypeel.com">buypeel.com</a>.</p>
          </header>
        `;
      }
      case MissingParamsError: {
        return h`
          <header>
            <h1>Shop explorer</h1>
            <p>
              Explore your favourite Shopify shops. Try searching for <a href="misen.co">misen.co</a> or <a href="buypeel.com">buypeel.com</a>.
            </p>
          </header>
        `;
      }
    }
  }
}
