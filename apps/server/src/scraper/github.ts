const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export function extractGitHubUsername(url: string): string | null {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?]+)/i);
  return match?.[1] ?? null;
}

export async function scrapeGitHubProfile(urlOrUsername: string) {
  console.log(`\nStarting GitHub extraction for: ${urlOrUsername}`);
  
  const username = urlOrUsername.includes("github.com") 
    ? extractGitHubUsername(urlOrUsername) 
    : urlOrUsername;

  if (!username) {
    throw new Error("Invalid GitHub profile URL or username.");
  }

  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is missing. Please set it in your environment.");
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        name
        login
        bio
        company
        location
        websiteUrl
        followers { totalCount }
        createdAt
        
        # 1. The Profile README (Usually contains their badges and intro)
        repository(name: $username) {
          object(expression: "HEAD:README.md") {
            ... on Blob { text }
          }
        }

        # 2. Pinned Projects
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              primaryLanguage { name }
              repositoryTopics(first: 5) { nodes { topic { name } } }
            }
          }
        }

        # 3. Top 10 Owned Repositories (Great for cross-referencing resume projects)
        repositories(first: 10, orderBy: {field: STARGAZERS, direction: DESC}, ownerAffiliations: OWNER, isFork: false) {
          nodes {
            name
            description
            url
            stargazerCount
            primaryLanguage { name }
            updatedAt
          }
        }

        # 4. Contribution Graph / Stats
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions # Total for the last year
          }
        }

        # 5. Open Source Contributions (External repos they've pushed to, PR'd, or opened issues on)
        repositoriesContributedTo(first: 10, contributionTypes: [COMMIT, PULL_REQUEST, ISSUE], privacy: PUBLIC, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            nameWithOwner
            description
            stargazerCount
            url
            primaryLanguage { name }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: { username }
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
    }

    console.log("✅ GitHub Profile Scraped Successfully. Raw Data:\n");
    console.log(JSON.stringify(data.data.user, null, 2));
    
    return data.data.user;

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.log(`❌ GitHub Extraction Failed: ${errMsg}\n`);
    return null;
  }
}

export async function getSpecificRepoDetails(owner: string, repoName: string) {
  console.log(`\n[AI Tool] Fetching specific details for repo: ${owner}/${repoName}`);
  
  if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is missing.");
  }

  const query = `
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        name
        description
        url
        stargazerCount
        forkCount
        createdAt
        updatedAt
        isArchived
        licenseInfo { name }
        primaryLanguage { name }
        defaultBranchRef { name }
        repositoryTopics(first: 10) { nodes { topic { name } } }
        issues(states: OPEN) { totalCount }
        pullRequests(states: OPEN) { totalCount }
        languages(first: 6, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name } }
        }
        readme: object(expression: "HEAD:README.md") {
          ... on Blob { text }
        }
      }
    }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
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
    
    const repoData = data.data.repository;
    
    // FETCH ARCHITECTURE / FOLDER STRUCTURE
    let architecture = null;
    if (repoData && repoData.defaultBranchRef?.name) {
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/${repoData.defaultBranchRef.name}?recursive=1`, {
        headers: { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` }
      });
      
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        // Filter out noisy folders that destroy LLM context windows
        const noisyDirs = ['node_modules/', 'dist/', 'build/', '.git/', 'vendor/', '__pycache__/', 'out/', 'target/'];
        architecture = ((treeData as { tree?: Array<{ path: string }> }).tree || [])
          .filter(item => !noisyDirs.some(dir => item.path.includes(dir)))
          .map(item => item.path);
      }
    }

    return {
      ...repoData,
      architecture_tree: architecture
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.log(`❌ Repo Fetch Failed: ${errMsg}`);
    return null;
  }
}

// ==== Quick Test Execution ====
if (require.main === module) {
  // Test the massive single call
  const testUsername = process.argv[2] || "isubhendu";
  scrapeGitHubProfile(testUsername);
}
