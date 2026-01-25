import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";

/**
 * rehype-pretty-codeの設定
 */
const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
};

/**
 * MDXコンテンツをReactコンポーネントにコンパイルする
 */
export async function compileMDXContent<TFrontmatter>(
  source: string
): Promise<{
  content: React.ReactElement;
  frontmatter: TFrontmatter;
}> {
  const result = await compileMDX<TFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions]],
      },
    },
  });

  return {
    content: result.content,
    frontmatter: result.frontmatter,
  };
}
