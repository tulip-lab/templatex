#!/usr/bin/env bash
set -euo pipefail

apply=false

usage() {
  cat <<'EOF'
Usage: scripts/install-gitinfo-hooks.sh [--apply]

Inspect the Git hooks used to generate local GitInfo metadata.
The default mode is read-only. Pass --apply to install or update managed hooks.
EOF
}

case "${1:-}" in
  "")
    ;;
  --apply)
    apply=true
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(git -C "$script_dir/.." rev-parse --show-toplevel)"
source_hook="$repo_root/scripts/gitinfo2-hook.sh"
hook_dir="$(git -C "$repo_root" rev-parse --git-path hooks)"

if [[ "$hook_dir" != /* ]]; then
  hook_dir="$repo_root/$hook_dir"
fi

hooks=(post-checkout post-commit post-merge)
conflicts=()

for hook in "${hooks[@]}"; do
  target="$hook_dir/$hook"
  if [[ -e "$target" ]] && ! grep -qF '# TULIP-GITINFO2-HOOK' "$target"; then
    conflicts+=("$target")
  fi
done

if (( ${#conflicts[@]} > 0 )); then
  echo "Refusing to replace unmanaged Git hooks:" >&2
  printf '  %s\n' "${conflicts[@]}" >&2
  echo "Integrate them manually, then rerun this installer." >&2
  exit 1
fi

for hook in "${hooks[@]}"; do
  target="$hook_dir/$hook"
  if [[ -e "$target" ]] && cmp -s "$source_hook" "$target"; then
    action="current"
  elif [[ -e "$target" ]]; then
    action="update"
  else
    action="install"
  fi
  printf '%-12s %s\n' "$action" "$target"
done

if [[ "$apply" == false ]]; then
  echo "Dry run only. Re-run with --apply to make these changes."
  exit 0
fi

mkdir -p "$hook_dir"
for hook in "${hooks[@]}"; do
  install -m 0755 "$source_hook" "$hook_dir/$hook"
done

(
  cd "$repo_root"
  "$source_hook"
)
