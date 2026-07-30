import React from "react";
import { CopyCodeButton } from "./CopyCodeButton";
import { slugify } from "@/lib/content";

function textFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) return textFromChildren(children.props.children);
  return "";
}

function Heading({ level, children }: { level: 2 | 3; children: React.ReactNode }) {
  const id = slugify(textFromChildren(children));
  const Tag = `h${level}` as "h2" | "h3";
  return <Tag id={id}><a href={`#${id}`}>{children}</a></Tag>;
}

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const code = textFromChildren(children).replace(/\n$/, "");
  return <div className="article-code"><div><span>CODE / READONLY</span><CopyCodeButton code={code} /></div><pre><code>{highlightCode(code)}</code></pre></div>;
}

function highlightCode(code: string) {
  const tokens = code.split(/(\b(?:async|await|def|return|from|import|if|class|for|in|True|False|None)\b|#[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g);
  return tokens.map((token, index) => {
    const className = token.startsWith("#") ? "tok-comment" : /^["']/.test(token) ? "tok-string" : /^(async|await|def|return|from|import|if|class|for|in|True|False|None)$/.test(token) ? "tok-keyword" : undefined;
    return <span className={className} key={`${index}-${token.slice(0, 8)}`}>{token}</span>;
  });
}

export const mdxComponents = {
  h2: (props: { children: React.ReactNode }) => <Heading level={2} {...props} />,
  h3: (props: { children: React.ReactNode }) => <Heading level={3} {...props} />,
  pre: CodeBlock,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} rel={props.href?.startsWith("http") ? "noreferrer" : undefined} />,
};
