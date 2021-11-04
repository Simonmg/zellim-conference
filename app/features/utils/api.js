import { defaultServerURL } from '../config';
import { BinaryLike } from 'crypto';
import { sendAuthRequest, getConferenceData } from './auth';

import { SERVER, CONFERENCE_MODULE } from '../config';
export default class Api {
    constructor() {

    }

    async login(email: string, passwordHash: BinaryLike) {
        const request = await sendAuthRequest(
            `${defaultServerURL}/auth/login`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${window.btoa(`${email}:${passwordHash}`)}`,
                },
            },
            false,
        );
        if(!request?.ok) {
            console.error(request);
            const error = await request.json();
            return error;
        }

        const u = await request.json();
        return u;
    }

    async getRomInfo(roomName: string, userToken: string) {
        const request = await getConferenceData(
            `${SERVER.REMOTE}${CONFERENCE_MODULE.GET_TOKEN}${roomName}`,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    authorization: `${userToken}`,
                }
            },
            false
        );

        if(!request?.ok) {
            console.error(request);
            const error = await request.json();
            return error;
        }

        const u = await request.json();
        return u;
    }
}