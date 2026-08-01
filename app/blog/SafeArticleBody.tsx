import { Fragment } from "react";
import Image from "next/image";
import { slugify } from "@/lib/content";
import { CopyCodeButton } from "./CopyCodeButton";

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "list"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "image"; alt: string; src: string };

function parse(source: string): Block[] {
  const lines = source.split(/\r?\n/);
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith("```")) {
      flushParagraph();
      const language = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", language, code: code.join("\n") });
    } else if (/^!\[[^\]]*\]\(([^)]+)\)$/.test(line.trim())) {
      flushParagraph();
      const image = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/)!;
      if (image[2].startsWith("/api/media/") || image[2].startsWith("https://")) blocks.push({ type: "image", alt: image[1], src: image[2] });
    } else if (/^>\s?/.test(line)) {
      flushParagraph();
      blocks.push({ type: "blockquote", text: line.replace(/^>\s?/, "") });
    } else if (/^##\s/.test(line)) {
      flushParagraph();
      blocks.push({ type: "heading", level: 2, text: line.replace(/^##\s+/, "") });
    } else if (/^###\s/.test(line)) {
      flushParagraph();
      blocks.push({ type: "heading", level: 3, text: line.replace(/^###\s+/, "") });
    } else if (/^-\s/.test(line)) {
      flushParagraph();
      const items = [line.replace(/^-\s+/, "")];
      while (index + 1 < lines.length && /^-\s/.test(lines[index + 1])) {
        index += 1;
        items.push(lines[index].replace(/^-\s+/, ""));
      }
      blocks.push({ type: "list", items });
    } else if (!line.trim()) {
      flushParagraph();
    } else {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  return blocks;
}

function InlineText({ value }: { value: string }) {
  return <>{value.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((token, index) => {
    if (token.startsWith("`")) return <code key={index}>{token.slice(1, -1)}</code>;
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link && (link[2].startsWith("/") || link[2].startsWith("https://"))) return <a href={link[2]} key={index} rel={link[2].startsWith("https://") ? "noreferrer" : undefined}>{link[1]}</a>;
    return <Fragment key={index}>{token}</Fragment>;
  })}</>;
}

function HighlightedCode({ code }: { code: string }) {
  const tokens = code.split(/(\b(?:async|await|def|return|from|import|if|class|for|in|True|False|None|try|except)\b|#[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g);
  return <>{tokens.map((token, index) => {
    const className = token.startsWith("#") ? "tok-comment" : /^["']/.test(token) ? "tok-string" : /^(async|await|def|return|from|import|if|class|for|in|True|False|None|try|except)$/.test(token) ? "tok-keyword" : undefined;
    return <span className={className} key={`${index}-${token.slice(0, 8)}`}>{token}</span>;
  })}</>;
}

export function SafeArticleBody({ source }: { source: string }) {
  return <>{parse(source).map((block, index) => {
    if (block.type === "heading") {
      const id = slugify(block.text);
      const Tag = block.level === 2 ? "h2" : "h3";
      return <Tag id={id} key={`${id}-${index}`}><a href={`#${id}`}>{block.text}</a></Tag>;
    }
    if (block.type === "code") return <div className="article-code" key={`code-${index}`}><div><span>CODE / {block.language || "TEXT"}</span><CopyCodeButton code={block.code} /></div><pre><code><HighlightedCode code={block.code} /></code></pre></div>;
    if (block.type === "list") return <ul key={`list-${index}`}>{block.items.map((item) => <li key={item}><InlineText value={item} /></li>)}</ul>;
    if (block.type === "blockquote") return <blockquote key={`quote-${index}`}><InlineText value={block.text} /></blockquote>;
    if (block.type === "image") return <figure key={`image-${index}`}><Image src={block.src} alt={block.alt} width={1200} height={750} unoptimized /><figcaption>{block.alt}</figcaption></figure>;
    return <p key={`paragraph-${index}`}><InlineText value={block.text} /></p>;
  })}</>;
}
