import { useEffect } from "react";

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
}

const ensureMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const ensureLink = (rel: string, href: string) => {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

export const Seo = ({ title, description, canonical }: SeoProps) => {
  useEffect(() => {
    if (title) document.title = title;
    if (description) ensureMeta("description", description);
    if (canonical) ensureLink("canonical", canonical);
    // Basic page SEO improvements
    ensureMeta("viewport", "width=device-width, initial-scale=1.0");
  }, [title, description, canonical]);
  return null;
};
