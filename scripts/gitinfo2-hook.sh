#!/bin/sh
# TULIP-GITINFO2-HOOK
# Based on the post-commit, post-checkout, and post-merge sample hook shipped
# with gitinfo2 2.0.7.
set -eu

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0

if [ -n "${TULIP_GITINFO_OUTPUT_DIR:-}" ]; then
  output_dir=$TULIP_GITINFO_OUTPUT_DIR
elif [ -d "$repo_root/report" ]; then
  output_dir="$repo_root/report"
elif [ -d "$repo_root/templatex" ]; then
  output_dir="$repo_root/templatex"
else
  echo "gitinfo2: no report or templatex directory found" >&2
  exit 0
fi

if [ ! -d "$output_dir" ]; then
  echo "gitinfo2: skip missing output directory: $output_dir" >&2
  exit 0
fi

output_file="$output_dir/gitHeadLocal.gin"
temp_file=$(mktemp "$output_file.tmp.XXXXXX")
trap 'rm -f "$temp_file"' EXIT HUP INT TERM

first_tag=$(git describe --tags --always --dirty='-*' 2>/dev/null)
release_tag=$(
  git describe --tags --long --always --dirty='-*' \
    --match 'Release-*' 2>/dev/null
)

git --no-pager log -1 --date=short --decorate=short \
  --pretty=format:"\\usepackage[%
      shash={%h},
      lhash={%H},
      authname={%an},
      authemail={%ae},
      authsdate={%ad},
      authidate={%ai},
      authudate={%at},
      commname={%cn},
      commemail={%ce},
      commsdate={%cd},
      commidate={%ci},
      commudate={%ct},
      refnames={%d},
      firsttagdescribe={$first_tag},
      reltag={$release_tag}
  ]{gitexinfo}" HEAD > "$temp_file"
printf '\n' >> "$temp_file"

mv "$temp_file" "$output_file"
trap - EXIT HUP INT TERM

echo "gitinfo2: updated ${output_file#"$repo_root"/}"
