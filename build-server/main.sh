#!/bin/bash

export GIT_REPOSITORY_URL="$GIT_REPPOSITORY_URL"

git clone "$GIT_REPOSITORY_URL" /home/app/output # clones the repo to this dir

echo "Cloned repo to /home/app/output"

exec node script.js