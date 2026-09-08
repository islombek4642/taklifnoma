import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { DomainValidationError, NotFoundError, ConflictError } from "../domain/errors.js";

export function handleError(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): void {
  if (error instanceof DomainValidationError) {
    reply.code(400).send({ error: error.message, field: error.field });
    return;
  }

  if (error instanceof NotFoundError) {
    reply.code(404).send({ error: error.message });
    return;
  }

  if (error instanceof ConflictError) {
    reply.code(409).send({ error: error.message });
    return;
  }

  request.log.error(error);
  reply.code(500).send({ error: "Internal server error" });
}
