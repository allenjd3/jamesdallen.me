/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primaryGreen: "#81B29A",
				primaryYellow: "#F2CC8F",
				primaryRedOrange: "#E07A5F",
				background: "#F4F1DE",
			},
			fontFamily: {
				sans: ['"Josefin Sans"', ...defaultTheme.fontFamily.sans],
				display: ['"Bungee"', ...defaultTheme.fontFamily.sans],
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
