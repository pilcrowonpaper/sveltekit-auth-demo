export interface Users_Table {
	id: number,
	email: string,
	password: string,
	username: string,
	created: string,
	user_id: string,
	refresh_token: string
}

export interface Session {
	user_id?: string,
	email?: string,
	username?: string
}