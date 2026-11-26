#!/bin/bash
# Chrome をリモートデバッグモードで起動し、chrome-devtools-mcp に接続する
# MCP設定: claude mcp add chrome-devtools -- bash scripts/launch-chrome-devtools.sh

CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
PORT=9222
PROFILE="$HOME/.chrome-devtools-profile"

# 既にデバッグモードで起動中なら新規起動しない
if ! curl -s "http://localhost:$PORT/json/version" > /dev/null 2>&1; then
  "$CHROME" \
    --remote-debugging-port=$PORT \
    --user-data-dir="$PROFILE" \
    --no-first-run \
    --no-default-browser-check &
  # 起動待機（最大10秒）
  for i in $(seq 1 10); do
    if curl -s "http://localhost:$PORT/json/version" > /dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

# MCP サーバー起動
exec npx -y chrome-devtools-mcp@latest --autoConnect --no-usage-statistics
