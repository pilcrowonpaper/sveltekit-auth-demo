<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';
	import type { Session } from '$lib/types/supabase';

	export const load: Load = async (input) => {
		const response = await input.fetch('/api/auth');
		const user = (await response.json()) as Session;
		if (!user.user_id) return {};
		return {
			status: 302,
			redirect: '/'
		};
	};
</script>

<script lang="ts">
	let username: string, email: string, password: string;

	const signUp = async () => {
		const response = await fetch('/api/create-user', {
			method: 'POST',
			credentials: 'same-origin',
			body: JSON.stringify({
				email,
				username,
				password
			})
		});
		if (response.ok) {
			window.location.href = '/';
		} else {
			const data = await response.json();
			alert(data.message);
		}
	};
</script>

<div>
	<h1>Sign Up</h1>
	<p>username</p>
	<input bind:value={username} />
	<p>email</p>
	<input bind:value={email} />
	<p>password</p>
	<input type="password" bind:value={password} />
	<button on:click={signUp}>Continue</button>
	<a href="/signin">Sign in</a>
</div>
