const readline = require("readline");
const fetch = require("node-fetch");

// Read the GitHub token from the system environment
const GHTOKEN = process.env.GHTOKEN;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function promptForColumnURL() {
	rl.question(
		"Enter the GitHub column URL (e.g., https://github.com/orgs/Automattic/projects/148#column-<column-id>): ",
		async (url) => {
			// Extract the column ID from the URL
			const columnIdMatch = url.match(/#column-(\d+)$/);

			if (columnIdMatch) {
				const columnId = columnIdMatch[1];
				try {
					const columnData = await fetchColumnData(columnId);
					console.log(`Column Name: ${columnData.name}`);

					rl.question("Is this the correct column? (yes/no): ", (answer) => {
						if (answer.toLowerCase() === "yes") {
							// User confirmed the column, proceed with further processing
							rl.close();
							process.exit(0);
						} else {
							// User did not confirm the column, prompt again
							promptForColumnURL();
						}
					});
				} catch (error) {
					console.error(error);
					rl.close();
					process.exit(1);
				}
			} else {
				console.error(
					"Invalid column URL. Please make sure it includes #column-<column-id>."
				);
				promptForColumnURL();
			}
		}
	);
}

async function fetchColumnData(columnId) {
	const url = `https://api.github.com/projects/columns/${columnId}`;
	const headers = {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${GHTOKEN}`,
		"X-GitHub-Api-Version": "2022-11-28",
	};

	try {
		const response = await fetch(url, { headers });
		if (response.ok) {
			const data = await response.json();
			return data;
		} else {
			throw new Error(
				`Failed to fetch column data from GitHub API: ${response.status} ${response.statusText}`
			);
		}
	} catch (error) {
		throw error;
	}
}

// Start by prompting for the column URL
promptForColumnURL();
