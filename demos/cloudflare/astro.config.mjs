// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import {
	d1,
	r2,
	cloudflareImages,
} from "@emdash-cms/cloudflare";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	output: "server",
	adapter: cloudflare({
		imageService: "cloudflare",
	}),
	i18n: {
		defaultLocale: "en",
		locales: ["en", "fr", "es"],
		fallback: {
			fr: "en",
			es: "en",
		},
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB" }),
			storage: r2({ binding: "MEDIA" }),
			mediaProviders: [
				cloudflareImages({
					accountIdEnvVar: "CF_MEDIA_ACCOUNT_ID",
					apiTokenEnvVar: "CF_MEDIA_API_TOKEN",
					accountHash: "5LGXGUnHU18h6ehN_xjpXQ",
				}),
			],
			plugins: [
				formsPlugin(),
			],
		}),
	],
	devToolbar: { enabled: false },
});
