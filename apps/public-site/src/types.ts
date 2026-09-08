import type { BackendApiClient } from "./services/backend-api-client.js";

export interface AppDependencies {
  backendApiClient: BackendApiClient;
}
