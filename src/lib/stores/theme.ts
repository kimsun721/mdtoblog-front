import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>('light');

	return {
		subscribe,
		init() {
			if (!browser) return;
			const stored = localStorage.getItem('theme') as Theme | null;
			const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			const initial: Theme = stored ?? preferred;
			this.apply(initial);
			set(initial);
		},
		apply(theme: Theme) {
			if (!browser) return;
			document.documentElement.setAttribute('data-theme', theme);
			localStorage.setItem('theme', theme);
		},
		toggle() {
			update((current) => {
				const next: Theme = current === 'dark' ? 'light' : 'dark';
				this.apply(next);
				return next;
			});
		}
	};
}

export const theme = createThemeStore();
