import { describe, expect, it } from "vitest";
import { DomainValidationError, NotFoundError } from "../../../src/domain/errors.js";

describe("domain errors", () => {
  it("DomainValidationError carries a field and message", () => {
    const error = new DomainValidationError("groomName", "groomName is required");
    expect(error.field).toBe("groomName");
    expect(error.message).toBe("groomName is required");
    expect(error).toBeInstanceOf(Error);
  });

  it("NotFoundError carries a resource name", () => {
    const error = new NotFoundError("Invitation");
    expect(error.message).toBe("Invitation not found");
  });
});
