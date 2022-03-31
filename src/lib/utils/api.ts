import type { RequestHandlerOutput } from '@sveltejs/kit/types/internal';

export const returnError = (status: number, message: string): RequestHandlerOutput => {
	return {
		status,
		body: {
			message
		}
	};
};