#!/bin/bash

# Clone the repo directly using the env var
git clone "$GIT_REPOSITORY_URL" /home/app/output 
# clones the repo to this output dir

echo "Cloned repo to /home/app/output"

exec node script.js