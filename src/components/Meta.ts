import {h} from '../../arvo';

export async function Meta(meta) {
  const {name, description} = await meta.read();

  return h`
    <header>
      <h1>${name}</h1>
      <p>${description}</p>
    </header>
  `;
}
