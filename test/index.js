const tape = require("tape");
const bent = require("bent");
const nock = require("nock");

const getJSON = bent("json");
const getBuffer = bent("buffer");

const server = require("../");

const nockResponseArray = [
	{
		version: "v15.0.1",
		date: "2020-10-21",
		files: [],
		npm: "7.0.3",
		v8: "8.6.395.17",
		uv: "1.40.0",
		zlib: "1.2.11",
		openssl: "1.1.1g",
		modules: "88",
		lts: false,
		security: false,
	},
	{
		version: "v15.0.0",
		date: "2020-10-20",
		files: [],
		npm: "7.0.2",
		v8: "8.6.395.16",
		uv: "1.40.0",
		zlib: "1.2.11",
		openssl: "1.1.1g",
		modules: "88",
		lts: false,
		security: true,
	},
	{
		version: "v14.15.0",
		date: "2020-10-27",
		files: [],
		npm: "6.14.8",
		v8: "8.4.371.19",
		uv: "1.40.0",
		zlib: "1.2.11",
		openssl: "1.1.1g",
		modules: "83",
		lts: "Fermium",
		security: true,
	},
	{
		version: "v14.14.0",
		date: "2020-10-15",
		files: [],
		npm: "6.14.8",
		v8: "8.4.371.19",
		uv: "1.40.0",
		zlib: "1.2.11",
		openssl: "1.1.1g",
		modules: "83",
		lts: false,
		security: true,
	},
];

const scope = nock("https://nodejs.org").get("/dist/index.json").reply(200, nockResponseArray);
scope.persist(true);

const context = {};

tape("setup", async function (t) {
	context.origin = `http://localhost:3000`;
	t.end();
});

tape("should get dependencies", async function (t) {
	t.plan(4);

	const html = (await getBuffer(`${context.origin}/dependencies`)).toString();

	t.match(html, /.*bent.*/, "should contain bent");
	t.match(html, /.*express.*/, "should contain express");
	t.match(html, /.*hbs.*/, "should contain hbs");
	t.match(html, /.*semver.*/, "should contain semver");
});

tape("should get minimum secure versions", async function (t) {
	t.plan(2);

	const response = await getJSON(`${context.origin}/minimum-secure`);

	t.deepEqual(response.v15, nockResponseArray[1], "v15 minimum secure version should match");
	t.deepEqual(response.v14, nockResponseArray[2], "v14 minimum secure version should match");
});

tape("should get latest-releases", async function (t) {
	t.plan(2);

	const response = await getJSON(`${context.origin}/latest-releases`);

	t.deepEqual(response.v15, nockResponseArray[0], "v15 latest release version should match");
	t.deepEqual(response.v14, nockResponseArray[2], "v14 latest release version should match");
});

tape.onFinish(() => process.exit(0));
