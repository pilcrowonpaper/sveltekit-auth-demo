import type { RequestHandler } from '@sveltejs/kit';

import { returnError } from '$lib/utils/api';
import { admin, key } from '$lib/utils/supabase-admin';
import * as jwt from 'jsonwebtoken';
import { dev } from '$app/env';
import * as cookie from 'cookie';
import type { Users_Table } from '$lib/types/supabase';

const secure = dev ? '' : ' Secure;';
// in minutes
const expiresIn = 15;

export const get: RequestHandler = async (event) => {
	const { token, refresh_token } = cookie.parse(event.request.headers.get('cookie') || '');
	try {
		const user = jwt.verify(token, key) as Record<any, any>;
		return {
			status: 200,
			body: user
		};
	} catch {
		if (!refresh_token) return returnError(401, 'Unauthorized user');
		const getUser = await admin.from('users').select().eq("refresh_token", refresh_token).maybeSingle()
		if (!getUser.data) {
            return {
                status: 401,
                headers: {
                    'set-cookie': [
                        `refresh_token=; Max-Age=0; Path=/;${secure} HttpOnly`
                    ]
                },
            }
        }
		const user_data = getUser.data as Users_Table;
		const new_user = {
			username: user_data.username,
			user_id: user_data.user_id,
			email: user_data.email
		};
		const token = jwt.sign(new_user, key, { expiresIn: `${expiresIn * 60 * 1000}` });
		return {
			status: 200,
			headers: {
				'set-cookie': [
					`token=${token}; Max-Age=${15 * 60}; Path=/;${secure} HttpOnly`
				]
			},
		};
	}
};
