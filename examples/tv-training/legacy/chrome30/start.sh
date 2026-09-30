#!/bin/sh
set -eu
mkdir -p /results
Xvfb :99 -screen 0 1440x1000x24 > /results/xvfb.log 2>&1 &
python3 -m http.server 8300 --bind 127.0.0.1 --directory /site > /results/server.log 2>&1 &
exec chromedriver --port=9515 --verbose --log-path=/results/chromedriver.log
