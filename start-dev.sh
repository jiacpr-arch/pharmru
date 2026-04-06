#!/bin/bash
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
cd "$(dirname "$0")"
exec node node_modules/.bin/next dev
