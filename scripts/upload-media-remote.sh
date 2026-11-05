#!/usr/bin/env bash
# Uploads the files behind every media record in the LIVE database to the live R2 bucket.
# Needed after `pnpm seed:remote`: the seed creates the records, but uploading files through
# wrangler's remote-binding proxy is unreliable, so files are pushed with `wrangler r2 object put`.
# Reads files from scripts/wp-export/optimized/ (a "-1" suffix added by Payload maps to the original file).
set -euo pipefail
cd "$(dirname "$0")/.."

list=$(npx wrangler d1 execute cccerith --remote --json --command "select filename, mime_type from media" 2>/dev/null |
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const r of JSON.parse(s)[0].results)console.log(r.filename+"\t"+r.mime_type)})')

ok=0; fail=0
while IFS=$'\t' read -r name mime || [[ -n "$name" ]]; do
  src="scripts/wp-export/optimized/$name"
  [[ -f "$src" ]] || src="scripts/wp-export/optimized/$(sed -E 's/-1\.([a-z0-9]+)$/.\1/' <<<"$name")"
  if [[ ! -f "$src" ]]; then echo "missing locally: $name"; fail=$((fail + 1)); continue; fi
  if npx wrangler r2 object put "cccerith-media/$name" --file "$src" --content-type "$mime" --remote >/dev/null 2>&1; then
    ok=$((ok + 1)); printf '.'
  else
    fail=$((fail + 1)); echo; echo "failed: $name"
  fi
done <<<"$list"
echo; echo "Uploaded $ok file(s), $fail problem(s)."
