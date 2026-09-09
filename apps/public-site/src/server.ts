import { buildApp } from "./app.js";
import { loadEnvConfig } from "./config/env-config.js";
import { createBackendApiClient } from "./services/backend-api-client.js";

const config = loadEnvConfig();

const app = buildApp({
  backendApiClient: createBackendApiClient(config.backendApiBaseUrl),
  botUsername: config.botUsername,
});

app
  .listen({ port: config.port, host: "0.0.0.0" })
  .then(() => console.log(`Public site listening on port ${config.port}`))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
