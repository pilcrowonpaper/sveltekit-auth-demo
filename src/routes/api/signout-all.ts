import type { RequestHandler } from '@sveltejs/kit';

import { admin } from '$lib/utils/supabase-admin';
import { randomUUID } from 'crypto';
import { dev } from '$app/env';
import * as cookie from 'cookie';

const secure = dev ? '' : ' Secure;';

export const post: RequestHandler = async (event) => {
	const { refresh_token } = cookie.parse(event.request.headers.get('cookie') || '');
	if (refresh_token) {
		const new_refresh_token = randomUUID();
		await admin.from('users').update({ refresh_token: new_refresh_token }).eq("refresh_token", refresh_token);
	}
	return {
		status: 200,
		headers: {
			'set-cookie': [
				`refresh_token=; Max-Age=0; Path=/; ${secure} HttpOnly`,
				`token=; Max-Age=0; Path=/;${secure} HttpOnly`
			]
		}
	};
};
