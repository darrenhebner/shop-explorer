import {NowResponse, NowRequest} from '@now/node';
import fetch from 'node-fetch';

import {renderToString} from '../arvo';
import {App} from '../src';

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

export default async (req: NowRequest, res: NowResponse) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');

  const html = await renderToString(App(req.url));
  res.send(html);
};
