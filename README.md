# webhook.floofy.dev
> :chestnut: **| Internal API for webhook systems made in Node.js using Express**

## Installation
### Requirements
- Docker (optional)
- Node.js v10 or higher

### Process (locally)
- [Fork](https://github.com/auguwu/webhooks/fork) this repository and clone it on your machine (``git clone https://github.com/$USERNAME/webhooks``), omit `$USERNAME` with your GitHub username
- Change the directory to where you forked the repository and run `npm install`, this should install all dependencies
- Follow the [configuration](#configuration) guide
- Run the application with `npm start` and it should be booted up!

### Process (Docker)
> This process is recommended for production environments!
>
> If you are running Windows or macOS, install **Docker Desktop** before continuing.

- [Fork](https://github.com/auguwu/webhooks/fork) this repository and clone it on your machine (``git clone https://github.com/$USERNAME/webhooks``), omit `$USERNAME` with your GitHub username
- Follow the [configuration](#configuration) guide
- Create the image with `npm run docker:build`, it should create an image called `webhooks` with the `latest` tag.
- Run the image with `npm run docker:run`, it should create a container with a specified ID and it should be running!

## Configuration
```env
# The webhook URL (required)
DISCORD_WEBHOOK_URL=

# The environment of the application
# Accepts: 'development' or 'production'
NODE_ENV=

# The secret for validating data
# Run `node -e 'console.log(require("crypto").randomBytes(16).toString("hex"))'` to generate a random SECRET key
SECRET=

# The port of the server to run on
# Default: 3621
PORT=
```

## License
**webhooks** is released under the [MIT](/LICENSE) license.
