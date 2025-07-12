# Web Application & API

This directory contains the web-facing part of the project, which includes:

-   A **Vue.js frontend** application located in the `src` folder.
-   **Serverless API endpoints** located in the `api` folder, which handle the game's leaderboard functionality by connecting to an Upstash Redis database.

## Deployment

This part of the project is intended to be deployed to Vercel. To deploy, navigate to this directory and run:

`nlx vercel --prod`
