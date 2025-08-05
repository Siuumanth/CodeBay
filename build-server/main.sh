#!/bin/bash

# Get this link from ENV variable
export GIT_REPOSITORY_URL="$GIT_REPPOSITORY_URL"

git clone "$GIT_REPOSITORY_URL" /home/app/output 
# clones the repo to this output dir

echo "Cloned repo to /home/app/output"

exec node script.js