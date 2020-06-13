import {h} from '../../arvo';

export async function Meta(meta) {
  const {name, description, url} = await meta.read();

  return h`
    <header>
      <h1>${name}</h1>
      <p>${description}</p>

      ${url ? h`<a class="cta" href="${url}">Visit shop</a>` : ''}
    </header>
  `;
}
