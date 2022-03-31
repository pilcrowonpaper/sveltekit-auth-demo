import type { RequestHandler } from '@sveltejs/kit';

import { validateEmail } from '$lib/utils/auth';
import { returnError } from '$lib/utils/api';
import { admin, key } from '$lib/utils/supabase-admin';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { dev } from '$app/env';
import { randomUUID } from 'crypto';

interface Body {
	email: string;
	password: string;
	username: string;
}

const secure = dev ? '' : ' Secure;';
// in minutes
const expiresIn = 15;
// in days
const refresh_token_expiresIn = 30;

export const post: RequestHandler = async (event) => {
	const body = (await event.request.json()) as Body;
	if (!body.email || !body.password || !body.username) return returnError(400, 'Invalid request');
	if (!validateEmail(body.email) || body.username.length < 4 || body.password.length < 6)
		return returnError(400, 'Bad request');
	const check_user = await admin
		.from('users')
		.select()
		.or(`email.eq.${body.email},username.eq.${body.username}`)
		.maybeSingle()
	if (check_user.data) return returnError(405, 'User already exists');
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(body.password, salt);
	const user_id = randomUUID();
	const refresh_token = randomUUID();
	const create_user = await admin.from('users').insert([
		{
			email: body.email,
			username: body.username,
			password: hash,
			user_id,
			refresh_token
		}
	]);
	if (create_user.error) return returnError(500, create_user.statusText);
	const user = {
		username: body.username,
		user_id,
		email: body.email
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
