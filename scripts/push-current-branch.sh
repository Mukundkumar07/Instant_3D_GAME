#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "No Git remote named 'origin'. Add your GitHub repo, then run this again:"
  echo "  git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git"
  exit 1
fi
branch=$(git branch --show-current)
echo "Pushing branch: $branch -> origin"
git push -u origin "$branch"
