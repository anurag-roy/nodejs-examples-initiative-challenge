"use strict";

const bent = require("bent");
const semver = require("semver");
const express = require("express");
const dependencies = require("./package.json").dependencies;
const ENDPOINT = "https://nodejs.org/dist/index.json";
const PORT = 3000;

const getJson = bent("json");
const app = express();

app.set("view engine", "hbs");

/** Route i */
app.get("/dependencies", (_request, response) => {
	// Pass the dependencies object to the hbs template
	response.render("dependencies", { dependencies });
});

/** Route ii */
app.get("/minimum-secure", async (_request, response) => {
	const releasesArray = await getJson(ENDPOINT);

	// Get Minimum Secure Releases Array
	const minimumSecureReleases = getHighestVersions(
		releasesArray.filter((release) => release.security),
	);

	response.json(minimumSecureReleases);
});

/** Route iii */
app.get("/latest-releases", async (_request, response) => {
	const releasesArray = await getJson(ENDPOINT);

	// Get Latest Releases Array
	const latestReleases = getHighestVersions(releasesArray);

	response.json(latestReleases);
});

/** Get highest version of each release line from the passed array of releases */
const getHighestVersions = (releasesArray) => {
	const highestVersionMap = new Map();

	releasesArray.forEach((release) => {
		// Get major version and create a key, e.g. v14, v8, etc.
		const majorVersionNo = semver.major(release.version);
		const key = `v${majorVersionNo}`;

		// If no entry is present for a version, create a new one
		if (!highestVersionMap.has(key)) {
			highestVersionMap.set(key, release);
		} else {
			// Else retrieve the stored entry and compare
			// If this release version is greater, replace with this release
			const storedObject = highestVersionMap.get(key);
			if (semver.gt(release.version, storedObject.version)) {
				highestVersionMap.set(key, release);
			}
		}
	});

	// Create and return the map as an object
	return Object.fromEntries(highestVersionMap);
};

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
