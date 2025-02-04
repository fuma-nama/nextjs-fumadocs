import type { Source, VirtualFile } from "fumadocs-core/source";
import { compile, type CompiledPage } from "../compile-md";
import * as path from "node:path";
import { meta } from "../meta";
import { repoConfig } from "@/config";
import { fetchBlob, getDocsSha, octokit } from "../github";
import { getTitleFromFile } from "../get-title-from-file";

export async function createGitHubSource(): Promise<
  Source<{
    metaData: { title: string; pages: string[] }; // Your custom type
    pageData: {
      title: string;
      load: () => Promise<CompiledPage>;
    }; // Your custom type
  }>
> {
  console.log("looking for sha of the docs directory...");
  const sha = await getDocsSha();
  if (!sha) throw new Error("Failed to find sha of docs directory");

  const tree = await octokit.request(
    "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
    {
      owner: repoConfig.owner,
      repo: repoConfig.repo,
      tree_sha: sha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
      recursive: "true",
    },
  );

  const pages = tree.data.tree.flatMap((file) => {
    if (!file.path || !file.url || file.type === "tree") return [];

    if (path.extname(file.path) === ".json") {
      console.warn(
        "We do not handle .json files at the moment, you need to hardcode them",
      );
      return [];
    }

    return {
      type: "page",
      path: file.path,
      data: {
        title: getTitleFromFile(file.path),

        async load() {
          const content = await fetchBlob(file.url as string);

          return compile(file.path!, content);
        },
      },
    } satisfies VirtualFile;
  });

  return {
    files: [...pages, ...meta],
  };
}
