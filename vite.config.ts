import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import biomePlugin from "vite-plugin-biome";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
// GitHub Pages (project site): задать VITE_BASE_PATH=/repo-name/ в CI; локально — '/'.
const base = process.env.VITE_BASE_PATH?.replace(/\/?$/, "/") ?? "/";

export default defineConfig({
	base,
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
		tsconfigPaths: true,
	},
	plugins: [
		react(),
		biomePlugin(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			manifestFilename: "site.webmanifest",
			manifest: {
				name: "push log",
				short_name: "push log",
				lang: "ru",
				display: "standalone",
				theme_color: "#ffffff",
				background_color: "#ffffff",
				icons: [
					{
						src: "web-app-manifest-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			includeAssets: ["favicon.ico", "apple-touch-icon.png"],
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
				navigateFallback: `${base}index.html`,
			},
			devOptions: {
				enabled: true,
			},
		}),
	],
});
