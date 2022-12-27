#!/usr/bin/env bash

set -e

tmpdir=$(mktemp -d)
json_output="${1:-all-events.json}"
current_year=$(date +%Y)

python3 parser.py README > "$tmpdir/README.json"
for year in $(seq 2017 "$current_year"); do
  [ -r "../archives/$year.md" ] && python3 parser.py "$year" > "$tmpdir/$year.json"
done

# shellcheck disable=SC2035
python3 combine.py "$tmpdir"/*.json > "$json_output"
