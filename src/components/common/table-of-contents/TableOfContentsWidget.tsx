
import type { MarkdownHeading } from "astro";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/tooltip";

interface Props {
  headings: MarkdownHeading[];
}

function TocEntry({ heading, activeSlug }: { heading: MarkdownHeading, activeSlug: string | null }) {
  const liRef = useRef<HTMLLIElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const check = () => {
      const element = linkRef.current;
      if (element) {
        setIsTruncated(element.scrollWidth > element.clientWidth);
      }
    };

    check(); // Run synchronously

    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("resize", check);
    };
  }, []);

  // The link element, which will be conditionally wrapped by the Tooltip
  const link = (
    <a
      ref={linkRef}
      href={`#${heading.slug}`}
      className={`toc-link truncate-line text-sm ${
        heading.slug === activeSlug ? "toc-link-active" : ""
      }`}
      data-slug={heading.slug}
      style={{ marginLeft: `${(heading.depth - 2) * 1}rem` }}
    >
      {heading.text}
    </a>
  );

  return (
    <li ref={liRef}>
      {isTruncated ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent container={liRef.current}>
            <p>{heading.text}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  );
}

export function TableOfContentsWidget({ headings }: Props) {
  const toc = headings.filter(
    (heading) => heading.depth > 1 && heading.depth < 4,
  );
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headingsToObserve = toc
      .map((heading) => document.getElementById(heading.slug))
      .filter((h): h is HTMLElement => h !== null);

    if (headingsToObserve.length === 0) return;

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActiveSlug(visible[0].target.id);
      } else {
        const closestAbove = headingsToObserve
          .map((h) => ({
            id: h.id,
            top: h.getBoundingClientRect().top,
          }))
          .filter((h) => h.top <= 0)
          .sort((a, b) => b.top - a.top)[0];
        if (closestAbove) {
          setActiveSlug(closestAbove.id);
        }
      }
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "0px 0px -60% 0px",
      threshold: [0, 1.0],
    });

    headingsToObserve.forEach((heading) => observer.current?.observe(heading));

    return () => {
      observer.current?.disconnect();
    };
  }, [toc]);

  return (
    <TooltipProvider delayDuration={0}>
      <ul className="font-article-title space-y-2">
        {toc.map((heading) => (
          <TocEntry key={heading.slug} heading={heading} activeSlug={activeSlug} />
        ))}
      </ul>
    </TooltipProvider>
  );
}
