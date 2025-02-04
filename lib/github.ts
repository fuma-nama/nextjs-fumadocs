import { repoConfig } from "@/config";
import { Octokit } from "octokit";

const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error(`environment variable GITHUB_TOKEN is needed.`);

export const octokit = new Octokit({
  auth: token,
  request: {
    fetch: (request: any, opts?: any) => {
      return fetch(request, {
        ...opts,
        cache: "force-cache",
      });
    },
  },
});

export async function fetchBlob(url: string): Promise<string> {
  console.time(`fetch ${url}`);
  const res = await fetch(url, {
    cache: "force-cache",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const { content: base64 } = (await res.json()) as {
    content: string;
  };

  console.timeEnd(`fetch ${url}`);
  return Buffer.from(base64, "base64").toString();
}

/**
 * @returns Sha code of `/docs` directory in GitHub repo
 */
export async function getDocsSha() {
  const out = await octokit.request(
    "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
    {
      owner: repoConfig.owner,
      repo: repoConfig.repo,
      tree_sha: repoConfig.branch,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  const docs = out.data.tree.find((item) => item.path === "docs");
  return docs?.sha;
}
