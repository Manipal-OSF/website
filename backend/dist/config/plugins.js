"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    'users-permissions': {
        config: {
            jwt: {
                expiresIn: '7d',
            },
            jwtSecret: env('JWT_SECRET')
        },
    },
});
