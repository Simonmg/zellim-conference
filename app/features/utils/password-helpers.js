import crypto from 'crypto';

export default function hash(password) {
    return crypto.createHash('sha256').update(password).digest('base64');
}