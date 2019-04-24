import * as Sentry from "@sentry/node";
import bcrypt from "bcrypt";
import {dsn} from "../settings/config";

Sentry.init({dsn: dsn});

const saltRounds = 10;

export function sendSentryMessage(message) {
    Sentry.captureMessage(message);
}

export function sendSentryError(error) {
    Sentry.captureException(error);
}

export function makeHash(myPlaintextPassword) {
    return bcrypt.hashSync(myPlaintextPassword, saltRounds);
}

export function compareHash(myPlaintextPassword, hashPassword) {
    return bcrypt.compareSync(myPlaintextPassword, hashPassword);
}

export function getRequestUrl(req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
}