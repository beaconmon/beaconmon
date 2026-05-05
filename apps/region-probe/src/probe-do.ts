import type { ProbeRequest, ProbeResponse } from './types.js';

export class ProbeDurableObject implements DurableObject {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(_state: DurableObjectState, _env: unknown) {}

  async fetch(request: Request): Promise<Response> {
    let req: ProbeRequest;
    try {
      const body = await request.json() as Record<string, unknown>;
      if (
        typeof body?.url !== 'string' ||
        typeof body?.timeoutMs !== 'number' ||
        (body?.type !== 'http' && body?.type !== 'keyword')
      ) {
        return Response.json({ error: 'Invalid probe request: missing or invalid url, type, or timeoutMs' }, { status: 400 });
      }
      req = body as unknown as ProbeRequest;
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const result = await runProbe(req);
    return Response.json(result);
  }
}

async function runProbe(req: ProbeRequest): Promise<ProbeResponse> {
  const startedAt = Date.now();

  try {
    const response = await fetch(req.url, {
      method: 'GET',
      headers: {
        'user-agent': 'beaconmon-probe/1.0 (+https://beaconmon.com)',
      },
      signal: AbortSignal.timeout(req.timeoutMs),
    });

    const responseTimeMs = Date.now() - startedAt;

    // Keyword check
    if (req.type === 'keyword' && req.keyword !== undefined && req.keyword !== '') {
      const body = await response.text();
      const found = body.includes(req.keyword);
      const condition = req.keywordCondition ?? 'present';
      const success = condition === 'present' ? found : !found;

      if (!success) {
        return {
          success: false,
          statusCode: response.status,
          responseTimeMs,
          errorType: 'keyword_mismatch',
          errorMessage: condition === 'present'
            ? `Keyword "${req.keyword}" not found`
            : `Keyword "${req.keyword}" was present but should be absent`,
        };
      }

      return {
        success: true,
        statusCode: response.status,
        responseTimeMs,
        errorType: null,
        errorMessage: null,
      };
    }

    // HTTP check
    const success = response.status >= 200 && response.status < 300;
    return {
      success,
      statusCode: response.status,
      responseTimeMs,
      errorType: success ? null : 'non_2xx',
      errorMessage: success ? null : `HTTP ${response.status}`,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - startedAt;
    return {
      success: false,
      statusCode: null,
      responseTimeMs,
      ...classifyFetchError(err),
    };
  }
}

function classifyFetchError(err: unknown): Pick<ProbeResponse, 'errorType' | 'errorMessage'> {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (err.name === 'TimeoutError' || msg.includes('timeout') || msg.includes('timed out')) {
      return { errorType: 'timeout', errorMessage: err.message };
    }
    if (msg.includes('dns') || msg.includes('resolve') || msg.includes('enotfound')) {
      return { errorType: 'dns_error', errorMessage: err.message };
    }
    if (msg.includes('econnrefused') || msg.includes('connection refused')) {
      return { errorType: 'connection_refused', errorMessage: err.message };
    }
    return { errorType: 'unknown', errorMessage: err.message };
  }
  return { errorType: 'unknown', errorMessage: String(err) };
}
