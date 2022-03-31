import type { RequestHandler } from '@sveltejs/kit';

import { validateEmail } from '$lib/utils/auth';
import { returnError } from '$lib/utils/api';
import { admin, key } from '$lib/utils/supabase-admin';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { dev } from '$app/env';
import type { Users_Table } from '$lib/types/supabase';

interface Body {
	email_username: string;
	password: string;
}

const secure = dev ? '' : ' Secure;';
// in minutes
const expiresIn = 15;
// in days
const refresh_token_expiresIn = 30;

export const post: RequestHandler = async (event) => {
	const body = (await event.request.json()) as Body;
	if (!body.email_username || !body.password) return returnError(400, 'Invalid request');
	const valid_email = body.email_username.includes('@') && validateEmail(body.email_username);
	const valid_username = !body.email_username.includes('@') && body.email_username.length > 3;
	if ((!valid_email && !valid_username) || body.password.length < 6)
		return returnError(400, 'Bad request');
	const getUser = await admin
		.from('users')
		.select()
		.or(`username.eq.${body.email_username},email.eq.${body.email_username}`)
		.maybeSingle()
	if (!getUser.data) return returnError(405, 'User does not exist');
	const user_data = getUser.data as Users_Table;
	const authenticated = await bcrypt.compare(body.password, user_data.password);
	if (!authenticated) return returnError(401, 'Incorrect password');
	const refresh_token = user_data.refresh_token;
	const user = {
		username: user_data.username,
		user_id: user_data.user_id,
		email: user_data.email
	};
	const token = jwt.sign(user, key, { expiresIn: `${expiresIn * 60 * 1000}` });
	return {
		status: 200,
		headers: {
			'set-cookie': [
				`refresh_token=${refresh_token}; Max-Age=${
					refresh_token_expiresIn * 24 * 60 * 60
				}; Path=/; ${secure} HttpOnly`,
				`token=${token}; Max-Age=${15 * 60}; Path=/;${secure} HttpOnly`
			]
		}
	};
};
