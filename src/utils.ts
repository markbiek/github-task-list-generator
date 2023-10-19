import chalk from "chalk";
import fetch from "node-fetch";

export const GHTOKEN = process.env.GHTOKEN;

export function error(message: string): boolean {
	console.log("ERROR: " + chalk.red(message));

	return false;
}

export function success(message: string): boolean {
	console.log("SUCCESS: " + chalk.green(message));

	return true;
}

export function warning(message: string): boolean {
	console.log("WARNING: " + chalk.yellow(message));

	return true;
}

export function info(message: string): boolean {
	console.log(chalk.blue(message));

	return true;
}

export async function queryGithubAPI(url: string): Promise<any> {
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
				`Failed to fetch data from GitHub API: ${response.status} ${response.statusText}`
			);
		}
	} catch (error) {
		throw error;
	}
}
