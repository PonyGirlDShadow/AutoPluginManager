export const pluginsDirVar = "plugindir";
export const githubTokenVar = "token-gh";
export const allPluginsVar = "plugins";
export const fileLinkRegex = /[^/\\&\?]+\.\w(?=([\?&].*$|$))/i;
export const githubRepoRegex = /((git|ssh|http(s)?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)?(\/)?/i;
export const githubContentLink = "https://api.github.com/repos/{USER}/{REPO}/contents/{PATH}";
export const githubRefAddition = "?ref={REF}";