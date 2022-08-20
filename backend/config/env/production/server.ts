export default ({ env }: {env: any}) => ({
  url: env('MY_HEROKU_URL'),
});
