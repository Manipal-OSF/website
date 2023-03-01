# Local CMS configuration

## Prerequisites

- [yarn](https://yarnpkg.com/getting-started/install)
- [MongoDB account](https://account.mongodb.com/account/login)
- [Docker and Docker Compose](https://www.docker.com/) (If tweaking Dockerfile/compose.yaml)

## Steps

- `cd backend` or open a new terminal instance with the backend directory selected if you are using VSCode workspaces
- Populate the `.env` as per the `.env-example` given
  - `PAYLOAD_SECRET` can be any string. [Link](https://payloadcms.com/docs/production/deployment#security)
  - `PAYLOAD_PUBLIC_URL` should be `http://localhost:<port_of_your_choice>`
  - `MONGODB_URI` should be the URI you obtain after creating a MongoDB database instance
    - Format - `mongodb+srv://...`
- MongoDB setup
  - Create a new Atlas project
  - Create a new cluster inside the project
  - After the cluster is setup, press `Connect > Connect your application`
  - Copy the URI shown in the second step and paste in the `.env`
  - Go to the `Network Access` tab and add your IP address to it
  - Note - It is better to give admin permissions to the created database user
- Run `yarn install` to install dependencies
- Run `yarn dev` to run the app
- Before making a PR, run `yarn format` to format the code

## Working full stack

If you are working on the frontend too and want to use your locally hosted CMS

- cd `frontend` from the `website` folder
- Populate the `.env` file with the same value provided to `PAYLOAD_PUBLIC_URL` in the backend `.env` file
- Run the website `yarn dev`

## Running with Docker

This is not recommended for development unless specifically working on changing the Docker configuration as, AFAIK, hot reload does not work with Docker.

- Make sure that you are in the `backend` directory
- Make sure that the Docker daemon is running
- Run `docker compose up` to run the app
- Run it with the `-d` flag (after `up`) to run in detached mode (run containers in the background)
- Run it with the `--build` flag (after `up`) to build images before starting containers
