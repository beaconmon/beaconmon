export class RepositoryNotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'RepositoryNotFoundError';
  }
}

export class RepositoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryValidationError';
  }
}
