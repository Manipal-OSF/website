"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET', '5aa354bfd7d996c8bec0a890b4a5d6a3'),
    },
});
