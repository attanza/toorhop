let mix = require("laravel-mix");

mix
  .disableSuccessNotifications()
  .js("resources/assets/js/app.js", "public/js")
  .stylus("resources/assets/styl/app.styl", "public/css")
  .styles(["resources/assets/css/custom.css"], "public/css/custom.css");
