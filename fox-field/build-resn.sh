#!/usr/bin/env bash
set -u
OUT="resn-out"
mkdir -p "$OUT"
awk -F/ '{if (NF>1) {p=""; for(i=1;i<NF;i++){p=p $i "/"}; print p}}' resn-urls.txt | sort -u | while read -r d; do mkdir -p "$OUT/$d"; done
download() {
  p="$1"
  if curl -sfL --retry 3 --retry-delay 2 -A "Mozilla/5.0" -o "resn-out/$p.tmp" "https://resn.co.nz/$p"; then
    mv "resn-out/$p.tmp" "resn-out/$p"
  else
    echo "FAILED: $p" >> build-failures.txt
    rm -f "resn-out/$p.tmp"
  fi
}
export -f download
rm -f build-failures.txt
xargs -a resn-urls.txt -P 16 -I{} bash -c 'download "$@"' _ {}
if [ -s build-failures.txt ]; then echo "Download failures:"; cat build-failures.txt; fi
VER="20260721233115_1_0_a02666f"
node patch-light.js "resn-out/$VER/js/main_mobile.js" "resn-out/$VER/js/main_desktop_extended.js"
cp vern.obj "resn-out/$VER/models/drop_gem5.obj"
echo "Replaced gem model with Vern text object"
count=$(find resn-out -type f | wc -l)
echo "Downloaded $count files"
du -sh resn-out || true
if [ "$count" -lt 2000 ]; then echo "Too few files, failing build"; exit 1; fi
