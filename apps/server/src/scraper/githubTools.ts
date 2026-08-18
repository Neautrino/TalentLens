const GITHUB_API_BASE = 'https://api.github.com';

async function ghFetch(endpoint: string, options: RequestInit = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is missing");

  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`GitHub API Error ${response.status}: ${await response.text()}`);
  }

  if (options.headers && (options.headers as Record<string, string>)['Accept'] === 'application/vnd.github.v3.raw') {
    return response.text();
  }
  return response.json();
}

export async function get_profile(username: string) {
  try {
    return await ghFetch(`/users/${username}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}

export async function list_repositories(username: string, limit = 10) {
  try {
    return await ghFetch(`/users/${username}/repos?sort=updated&per_page=${limit}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}

export async function search_repositories(query: string, limit = 5) {
  try {
    return await ghFetch(`/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}

export async function get_repository(owner: string, repo: string) {
  try {
    return await ghFetch(`/repos/${owner}/${repo}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}

export async function get_repository_tree(owner: string, repo: string, branch = 'main') {
  try {
    return await ghFetch(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
  } catch (error: unknown) {
    try {
       return await ghFetch(`/repos/${owner}/${repo}/git/trees/master?recursive=1`);
    } catch (e) {
       const msg = error instanceof Error ? error.message : String(error);
       return { error: msg };
    }
  }
}

export async function get_file(owner: string, repo: string, path: string, branch = 'main') {
  try {
    return await ghFetch(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}

export async function search_code(query: string, owner: string, repo: string, limit = 5) {
  try {
    const q = encodeURIComponent(`${query} repo:${owner}/${repo}`);
    return await ghFetch(`/search/code?q=${q}&per_page=${limit}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}

export async function get_commits(owner: string, repo: string, limit = 5) {
  try {
    return await ghFetch(`/repos/${owner}/${repo}/commits?per_page=${limit}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}

export async function get_pull_requests(username: string, limit = 5) {
  try {
    return await ghFetch(`/search/issues?q=is:pr+author:${username}&sort=updated&order=desc&per_page=${limit}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}

export async function get_dependencies(owner: string, repo: string, branch = 'main') {
  const commonFiles = ['package.json', 'requirements.txt', 'go.mod', 'pom.xml', 'build.gradle', 'composer.json'];
  const results: Record<string, any> = {};

  for (const file of commonFiles) {
    const content = await get_file(owner, repo, file, branch);
    if (content && typeof content === 'string' && !content.startsWith('{"error"')) {
      results[file] = content;
    }
  }
  return Object.keys(results).length > 0 ? results : { message: "No standard dependency files found." };
}

export async function get_ci_cd(owner: string, repo: string) {
  const treeResponse = await get_repository_tree(owner, repo);
  
  if (!treeResponse || treeResponse.error || !treeResponse.tree) {
    return { error: "Could not fetch repository tree to find CI/CD files." };
  }

  const tree = treeResponse.tree as any[];
  const ciFiles = tree.filter(node => 
    node.path.startsWith('.github/workflows/') || 
    node.path === '.gitlab-ci.yml' || 
    node.path === 'Jenkinsfile' || 
    node.path === 'azure-pipelines.yml' ||
    node.path === 'travis.yml'
  );

  return { files: ciFiles.map(f => f.path) };
}

export async function get_file_history(owner: string, repo: string, path: string, limit = 5) {
  try {
    return await ghFetch(`/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=${limit}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}

export async function get_tech_stack(owner: string, repo: string) {
  try {
    const [languages, topics] = await Promise.all([
      ghFetch(`/repos/${owner}/${repo}/languages`),
      ghFetch(`/repos/${owner}/${repo}/topics`)
    ]);
    return { languages, topics: topics?.names || [] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: msg };
  }
}
/**
 * ============================================================================
 * TIER 2: THE CONFIGURABLE INVESTIGATOR (Dynamic GraphQL Menu Tool)
 * ============================================================================
 */

export type RepoField = 
  | "README" 
  | "TECH_STACK_LANGUAGES" 
  | "TOPICS" 
  | "OPEN_ISSUES_COUNT" 
  | "PULL_REQUESTS_COUNT" 
  | "LICENSE" 
  | "DEFAULT_BRANCH";

/**
 * 14. INSPECT REPOSITORY (Dynamic GraphQL Fetcher)
 * The AI selects exactly which fields it wants from the RepoField menu.
 * The backend stitches them into exactly 1 GraphQL query.
 */
export async function inspect_repository(owner: string, repoName: string, requested_fields: RepoField[]) {
  if (!process.env.GITHUB_TOKEN) {
    return { error: "GITHUB_TOKEN is missing." };
  }

  // Map the AI's choices to GraphQL snippets
  const graphqlSnippets: Record<RepoField, string> = {
    README: `readme: object(expression: "HEAD:README.md") { ... on Blob { text } }`,
    TECH_STACK_LANGUAGES: `languages(first: 6, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } }`,
    TOPICS: `repositoryTopics(first: 10) { nodes { topic { name } } }`,
    OPEN_ISSUES_COUNT: `issues(states: OPEN) { totalCount }`,
    PULL_REQUESTS_COUNT: `pullRequests(states: OPEN) { totalCount }`,
    LICENSE: `licenseInfo { name }`,
    DEFAULT_BRANCH: `defaultBranchRef { name }`
  };

  // Always fetch basic lightweight metadata
  let innerQuery = `
    name
    description
    url
    stargazerCount
    forkCount
    createdAt
    updatedAt
    isArchived
  `;

  // Dynamically attach the heavy/specific fields the AI asked for
  for (const field of requested_fields) {
    if (graphqlSnippets[field]) {
      innerQuery += `\n    ${graphqlSnippets[field]}`;
    }
  }

  const query = `
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        ${innerQuery}
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: { owner, name: repoName }
      }),
    });

    const data = await response.json();
    if (data.errors) throw new Error(JSON.stringify(data.errors));
    
    return data.data.repository;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { error: `Failed to inspect repo: ${msg}` };
  }
}
