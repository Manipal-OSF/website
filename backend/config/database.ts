export default ({ env }: {env: any}) => ({
  forceMigration: true,
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'postgres'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: env('DATABASE_SSL', false),
    },
    debug: false,
  },
});
