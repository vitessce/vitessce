// Adapted from https://github.com/svitejs/changesets-changelog-github-compact/blob/7a9b5648150e6a9b22aef6214c53fb82fba4c33c/packages/changesets-changelog-github-compact/src/index.ts#L1
// in order to ignore updated dependencies from within the repo.
const getGithubInfo = require('@changesets/get-github-info');
const { getInfo, getInfoFromPullRequest } = getGithubInfo;

async function getDependencyReleaseLine(changesets, dependenciesUpdated, options) {

	const repoName = options.repo.split('/')[1];
	const updatedDepenenciesList = dependenciesUpdated.filter(
		(dependency) => !(dependency.name === repoName || dependency.name.startsWith(`@${repoName}`))
	).map(
		(dependency) => `  - ${dependency.name}@${dependency.newVersion}`
	);

	if (updatedDepenenciesList.length === 0) return '';

	const changesetLink = `- Updated dependencies [${(
		await Promise.all(
			changesets.map(async (cs) => {
				if (cs.commit) {
					const { links } = await getInfo({
						repo: options.repo,
						commit: cs.commit
					});
					return links.commit;
				}
			})
		)
	)
		.filter((_) => _)
		.join(', ')}]:`;

	return [changesetLink, ...updatedDepenenciesList].join('\n');
}
async function getReleaseLine(changeset, type, options) {
	const repo = options.repo;
	let prFromSummary;//: number | undefined;
	let commitFromSummary;//: string | undefined;

	const replacedChangelog = changeset.summary
		.replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
			const num = Number(pr);
			if (!isNaN(num)) prFromSummary = num;
			return '';
		})
		.replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
			commitFromSummary = commit;
			return '';
		})
		.replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, '')
		.trim();

	// add links to issue hints (fix #123) => (fix [#123](https://....))
	const linkifyIssueHints = (line) =>
		line.replace(/(?<=\( ?(?:fix|fixes|see) )(#\d+)(?= ?\))/g, (issueHash) => {
			return `[${issueHash}](https://github.com/${repo}/issues/${issueHash.substring(1)})`;
		});
	const [firstLine, ...futureLines] = replacedChangelog
		.split('\n')
		.map((l) => linkifyIssueHints(l.trimRight()));

	const links = await (async () => {
		if (prFromSummary !== undefined) {
			let { links } = await getInfoFromPullRequest({
				repo,
				pull: prFromSummary
			});
			if (commitFromSummary) {
				links = {
					...links,
					commit: `[\`${commitFromSummary}\`](https://github.com/${repo}/commit/${commitFromSummary})`
				};
			}
			return links;
		}
		const commitToFetchFrom = commitFromSummary || changeset.commit;
		if (commitToFetchFrom) {
			const { links } = await getInfo({
				repo,
				commit: commitToFetchFrom
			});
			return links;
		}
		return {
			commit: null,
			pull: null,
			user: null
		};
	})();

	// only link PR or merge commit not both
	const suffix = links.pull ? ` (${links.pull})` : links.commit ? ` (${links.commit})` : '';

	return `\n- ${firstLine}${suffix}\n${futureLines.map((l) => `  ${l}`).join('\n')}`;
}

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine,
};
