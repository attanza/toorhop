### Toorhop Payment API

This is an API server as bridge between Main Toorhop API with third party payment methods

#### Environtment Setup

1.  Clone repo from [https://github.com/attanza/toorhop.git](https://github.com/attanza/toorhop.git "https://github.com/attanza/toorhop.git")
1.  Cd into repo.
1.  Run command `npm install`
1.  Run command `cp env.example .env`
1.  Open the env file: `vi .env` or `nano .env`
1.  Paste bellow env example and fill the vars as you need

        HOST=localhost
        PORT=4444
        NODE_ENV=<development | production>
        APP_NAME=Toorhop
        APP_URL=http://${HOST}:${PORT}
        CACHE_VIEWS=false
        APP_KEY=DRNKgHDAE30ASEfAiY29o2bK4FRQvNSZ
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_USER=<your mysql user>
        DB_PASSWORD=<your mysql password>
        DB_DATABASE=<your created database name>
        HASH_DRIVER=bcrypt
        PRODUCTION_APP_URL=https://midtrans.toorhop.com

        MAIL_CONNECTION=
        MAIL_PORT=
        MAIL_HOST=
        MAIL_USERNAME=
        MAIL_PASSWORD=

        MAIL_FROM=system@toorhop.id

        MIDTRANS_CLIENT_KEY=<your midtrans client key>
        MIDTRANS_SERVER_KEY=<your midtrans server key>
        MIDTRANS_URL=https://api.midtrans.com

        MIDTRANS_DEV_CLIENT_KEY=<your dev midtrans client key>
        MIDTRANS_DEV_SERVER_KEY=<your dev midtrans client key>
        MIDTRANS_DEV_URL=https://api.sandbox.veritrans.co.id/v2

        CLIENT_TOKEN_EXPIRATION=2

**Run on development**: `adonis serve --dev`
**Run on production**: `pm2 start server.js --name=api` (assuming you have [pm2](http://pm2.keymetrics.io/ "pm2") installed on your server)
