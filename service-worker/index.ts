import {renderToStream} from '../arvo';
import {App} from '../src';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const {pathname} = new URL(event.request.url);
  event.respondWith(
    new Response(renderToStream(App(pathname)), {
      headers: {'Content-Type': 'text/html; charset=utf-8 '},
    })
  );
});
