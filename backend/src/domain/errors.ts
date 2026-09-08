export class DomainValidationError extends Error {
  readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = "DomainValidationError";
    this.field = field;
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
