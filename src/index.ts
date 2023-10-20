import { input, confirm } from "@inquirer/prompts";

import { error, info, queryGithubAPI, GHTOKEN } from "./utils.js";

import type { ColumnCard, ColumnData } from "./types.ts";

// Read the GitHub token from the system environment
if (!GHTOKEN) {
	error("Please set the GHTOKEN environment variable.");
	process.exit(1);
}

async function promptForColumnURL(): Promise<number> {
	const url = await input({
		message:
			"Enter the GitHub column URL (e.g., https://github.com/orgs/Automattic/projects/148#column-<column-id>):",
	});
	// Extract the column ID from the URL
	const columnIdMatch = url.match(/#column-(\d+)$/);

	if (columnIdMatch) {
		const columnId = parseInt(columnIdMatch[1]);
		const columnData: ColumnData = await fetchColumnData(columnId);
		info(`Column Name: "${columnData.name}"`);

		const answer = await confirm({
			default: true,
			message: "Is this the correct column? ",
		});
		if (!answer) {
			error(
				"Aborting. Please run the script again with the correct column URL."
			);
			process.exit(1);
		}

		return columnId;
	} else {
		error(
			"Invalid column URL. Please make sure it includes #column-<column-id>."
		);
		process.exit(1);
	}
}

async function fetchColumnData(columnId: number): Promise<ColumnData> {
	const url = `https://api.github.com/projects/columns/${columnId}`;

	return await queryGithubAPI(url);
}

async function fetchColumnCards(columnId: number): Promise<ColumnCard[]> {
	const url = `https://api.github.com/projects/columns/${columnId}/cards`;

	return await queryGithubAPI(url);
}

async function main() {
	const columnId = await promptForColumnURL();
	const cards = await fetchColumnCards(columnId);

	let markdown = "";
	for (let card of cards) {
		if (
			!card.note &&
			Object.hasOwnProperty.call(card, "content_url") &&
			card.content_url
		) {
			// This is a card for a GitHub issue or PR so we need to fetch the title and url from the api.
			const content = await queryGithubAPI(card?.content_url);
			const contentId = content.html_url.split("/").slice(-1)[0];

			card.note = content.title;
			card.note += ` [${contentId}](${content.html_url}})`;
		}

		let cleanNote = "";

		// Replace Phabricator shortcodes with a markdown link
		cleanNote = card.note.replace(
			/D(\d+)-code/g,
			"[D$1](https://code.a8c.com/D$1)"
		);

		// Remove any newlines from the note
		cleanNote = cleanNote.replace(/\n|\r/g, " ").replace(/\s{2,}/, " ");

		markdown += `- ${cleanNote}\n`;
	}

	console.log(markdown);
}

main();
