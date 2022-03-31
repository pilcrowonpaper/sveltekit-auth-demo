<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';
	import type { Session } from '$lib/types/supabase';

	export const load: Load = async (input) => {
		const response = await input.fetch('/api/auth');
		const user = (await response.json()) as Session;
		if (!user.user_id) {
			return {
				status: 302,
				redirect: '/signin'
			};
		}
		return {
			props: {
				user
			}
		};
	};
</script>

<script lang="ts">
	export let user: Session = {};

	const signOut = async (): Promise<void> => {
		await fetch('/api/signout', {
			method: 'POST'
		});
		window.location.href = '/';
	};

	const signOutAll = async (): Promise<void> => {
		await fetch('/api/signout-all', {
			method: 'POST'
		});
		window.location.href = '/';
	};
</script>

<div>
	<h1>Hello, {user.username}!</h1>
	<p>Your email is {user.email},<br /> and your unique user-id is {user.user_id}</p>
	<button on:click={signOut}>Sign out from device</button>
	<button on:click={signOutAll}>Sign out from all devices</button>
</div>
