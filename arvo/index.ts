export async function renderToString(app: AsyncGenerator<string>) {
  let result = '';

  for await (let value of app) {
    result += value;
  }

  return result;
}

const encoder = new TextEncoder();

export function renderToStream(app: AsyncGenerator<string>) {
  return new ReadableStream({
    async start(controller) {
      for await (let value of app) {
        controller.enqueue(encoder.encode(value));
      }

      controller.close();
    },
  });
}

export function h(strings: TemplateStringsArray, ...values: ArvoComponent[]) {
  const allItems: AsyncGenerator<string> | ArvoComponent[] = [];

  strings.forEach((str, i) => {
    allItems.push(str);
    if (i in values) allItems.push(values[i]);
  });

  async function* run(iterator = allItems): AsyncGenerator<string> {
    for await (const item of iterator) {
      if (typeof item === 'string') {
        yield item;
      } else {
        yield* run(item);
      }
    }
  }

  return run();
}

export type ArvoComponent =
  | Promise<AsyncGenerator<string>>
  | AsyncGenerator<string>
  | AsyncGenerator<string>[]
  | string;
