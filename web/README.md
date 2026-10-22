# Web Application & API

This directory contains the web-facing part of the project, which includes:

-   A **Vue.js frontend** application located in the `src` folder.
-   **Serverless API endpoints** located in the `api` folder, which handle the game's leaderboard functionality by connecting to an Upstash Redis database.

## Deployment

The backend requires patched Node.js 22 (22.23.4 or newer). Its `engines.node`
range keeps the existing Vercel Node 22 major while declaring the patched minimum
for the October 2026 eMudhra incident. Use a patched runtime locally as well.

Vercel selects a major version and manages minor and patch updates itself;
the package range does not force Vercel to install an exact patch. Before deploying,
verify that Vercel has rolled out Node 22.23.4 or a later patched Node 22 runtime.
Confirm the function's actual runtime version and that its TLS verifier rejects
the compromised chains. A successful request to Redis alone does not prove this.
A redeploy on an unpatched runtime does not fix the issue. Certificate reissuance
is not required for the current Google Trust Services Vercel certificate chain.

The fixed Node release is documented in the
[Node 22.23.4 security release](https://github.com/nodejs/node/releases/tag/v22.23.4).

This part of the project is intended to be deployed to Vercel. To deploy, navigate to this directory and run:

`nlx vercel --prod`
