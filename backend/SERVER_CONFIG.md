# Server configuration

## Deleting an old server

- Copy the appdata folder in ~ directory and store it locally for future use. (Contains all media files and swag config)

## Setting up a new server

- Change domain DNS records to point to new URL.
- Add the new server IP address to MongoDB network tab
- Install `docker` and `git` in the server if not previously existing.
- `git clone <repository url>`
- `cd /website/backend`
- `touch .env && nano .env` and add all secrets to it
- If an existing `appdata` folder does not exist (from the old server)
  - `sudo docker compose up -d`
  - `sudo docker ps -a`
  - `sudo docker exec -it <swag container id> bash`
  - `cd config/nginx/proxy-confs`
  - `touch cms.subdomain.conf && nano cms.subdomain.conf`
  - Copy contents of `nginx.conf` to the created file
  - Save and exit the container - `exit`
  - `sudo docker restart <swag container id>` - restart the swag container
- Else
  - Copy `appdata` folder to `~`
  - `sudo docker compose up -d`
- Server should hopefully be alright and the CMS should work now.

## Note

- Can add Prometheus and Grafana to log and monitor the server
- Can possibly move MongoDB to the server so as to avoid the headache of configuring the IP.
