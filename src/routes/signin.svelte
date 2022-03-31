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
	let email_username: string, password: string;

	const signIn = async () => {
		const response = await fetch('/api/signin', {
			method: 'POST',
			credentials: 'same-origin',
			body: JSON.stringify({
				email_username,
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
	<h1>Sign In</h1>
	<p>email or username</p>
	<input bind:value={email_username} />
	<p>password</p>
	<input type="password" bind:value={password} />
	<button on:click={signIn}>Continue</button>
	<a href="/signup"> Create an account </a>
</div>
