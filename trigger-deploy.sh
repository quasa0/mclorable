#!/usr/bin/env bash
set -euo pipefail

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [[ -z "${repo_root}" ]]; then
  echo "Error: not a git repository."
  exit 1
fi
cd "${repo_root}"

timestamp=$(date -u +"%Y%m%d-%H%M%SZ")
random_suffix=$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 6 || echo "${RANDOM}")
file_name="deploy-trigger-${timestamp}-${random_suffix}.txt"

echo "trigger-deploy ${timestamp}" > "${file_name}"

git add "${file_name}"

current_branch=$(git rev-parse --abbrev-ref HEAD)

git commit -m "chore: trigger deploy (${file_name})"

if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  git push
else
  git push -u origin "${current_branch}"
fi

echo "Created and pushed ${file_name} to ${current_branch}"


