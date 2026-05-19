export class AiError extends Error {
  override readonly name: string = 'AiError';
  override readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

export class AiTimeoutError extends AiError {
  override readonly name = 'AiTimeoutError';
}

export class AiQuotaError extends AiError {
  override readonly name = 'AiQuotaError';
}

export class AiSchemaError extends AiError {
  override readonly name = 'AiSchemaError';
}

export class AiProviderError extends AiError {
  override readonly name = 'AiProviderError';
}
