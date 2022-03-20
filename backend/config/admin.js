module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'addd704b284f6162a26903a324a2dbdc'),
  },
});
