# base image
FROM ubuntu:focal 

RUN apt-get update
RUN apt-get install -y curl
# for making api calls to install dependencies

# setting up node version 20
# -sL for silent download, silent download means no progress bar

# adding node source repo
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -

RUN apt-get upgrade -y

# actually installing node n git
RUN apt-get install -y nodejs
RUN apt-get install git -y

# Chanige working directory
WORKDIR /home/app
COPY main.sh main.sh

# After everyting gets installed
ENTRYPOINT [ "/home/app/main.sh" ]