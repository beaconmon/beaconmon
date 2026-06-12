import { createServer, type Server } from 'node:http';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { runContentCheck } from './content.js';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    switch (req.url) {
      case '/ok':
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end('<html><body><p>hello world</p></body></html>');
        break;
      case '/redirect':
        res.writeHead(301, { location: '/ok' });
        res.end();
        break;
      case '/missing':
        res.writeHead(404, { 'content-type': 'text/html' });
        res.end('<html><body><p>page not found</p></body></html>');
        break;
      case '/error':
        res.writeHead(500, { 'content-type': 'text/html' });
        res.end('<html><body><p>internal error</p></body></html>');
        break;
      default:
        res.writeHead(404);
        res.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('no port');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});

describe('runContentCheck', () => {
  it('succeeds on a 200 response and extracts text', async () => {
    const result = await runContentCheck({ monitorId: 'm1', url: `${baseUrl}/ok`, timeoutMs: 5000 });
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.content).toBe('hello world');
  });

  it('follows redirects and returns the final page content', async () => {
    const result = await runContentCheck({ monitorId: 'm1', url: `${baseUrl}/redirect`, timeoutMs: 5000 });
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.content).toBe('hello world');
  });

  it('fails on a 404 instead of snapshotting the error page', async () => {
    const result = await runContentCheck({ monitorId: 'm1', url: `${baseUrl}/missing`, timeoutMs: 5000 });
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.content).toBeNull();
    expect(result.errorType).toBe('non_2xx');
  });

  it('fails on a 500 instead of snapshotting the error page', async () => {
    const result = await runContentCheck({ monitorId: 'm1', url: `${baseUrl}/error`, timeoutMs: 5000 });
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(500);
    expect(result.errorType).toBe('non_2xx');
  });
});
