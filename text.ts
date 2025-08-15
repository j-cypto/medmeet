export function linkify(text: string) {
  // @mentions
  let out = text.replace(/(^|[\s])@([a-zA-Z0-9_]+)/g, '$1<a class="link" href="/u/$2">@$2</a>');
  // #hashtags
  out = out.replace(/(^|[\s])#([a-zA-Z0-9_]+)/g, '$1<a class="link" href="/t/$2">#$2</a>');
  // urls
  out = out.replace(/(https?:\/\/[^\s]+)/g, '<a class="link" href="$1" target="_blank" rel="noreferrer">$1</a>');
  return out;
}

export function extractTags(text: string): string[] {
  const set = new Set<string>();
  (text.match(/#([a-zA-Z0-9_]+)/g) || []).forEach(t => set.add(t.slice(1).toLowerCase()));
  return Array.from(set);
}
