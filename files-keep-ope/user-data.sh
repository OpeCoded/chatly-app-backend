#!/bin/bash

# this file consists of tools that we'd need for our app
# Platform is AMAZON LINUX 2
# this function checks if a tool we want to install is already installed, if installed returns 1, else returns 0.
function program_is_installed {
  local return_=1

  type $1 >/dev/null 2>&1 || { local return_=0; }
  echo "$return_"
}

sudo yum update -y # update yum
sudo yum install ruby -y
sudo yum install wget -y
cd /home/ec2-user
wget https://aws-codedeploy-eu-central-1.s3.eu-central-1.amazonaws.com/latest/install
sudo chmod +x ./install
sudo ./install auto

# Check if NodeJs is installed. If not, install it
# -y means yes to everything
if [ $(program_is_installed node) == 0 ]; then
  curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -  # cmd to download the nodejs file (linux)
  sudo yum install -y nodejs # install nodejs file
fi

# Check if Git is installed. If not, install it
if [ $(program_is_installed git) == 0 ]; then
  sudo yum install git -y
fi

# Check if Docker is installed. If not, install it
if [ $(program_is_installed docker) == 0 ]; then
  sudo amazon-linux-extras install docker -y
  sudo systemctl start docker
  sudo docker run --name chatlyapp-redis -p 6379:6379 --restart always --detach redis # starts redis docker container in detach mode
fi

# Check if PM2 is installed. If not, install it
# -global install
if [ $(program_is_installed pm2) == 0 ]; then
  npm install -g pm2
fi

# cloning our source code from github from the development branch
# getting into home dir (Amazon linux 2 image)
cd /home/ec2-user

git clone -b development https://github.com/OpeCoded/chatly-app-backend.git # -b (branch to clone) - clones our app into the home dir
cd chatly-app-backend # cd into my app name or folder name
npm install
aws s3 sync s3://chatlyapp-env-files/develop . # the s3 bucket we defined in update-env-file.sh
unzip env-file.zip
cp .env.develop .env
npm run build # run build cmd
npm run start # start the app cmd
