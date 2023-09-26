#!/bin/bash

# the above line is important and must always come first at the top, it allows the shell to know that this file is a  bash script
# shell script to dynamically update our REDIS_HOST value in our .env file with the ElastiCache Primary Endpoint Address we got after creating a Redis Cluster

function program_is_installed {
  local return_=1

  type $1 >/dev/null 2>&1 || { local return_=0; }
  echo "$return_"
}

if [ $(program_is_installed zip) == 0 ]; then
  apk update
  apk add zip
fi

aws s3 sync s3://chatlyapp-env-files/develop . # We defined a bucket (chatlyapp-env-files/develop) to house our env file | path to .env file on s3 bucket, sync: downloads our .env file (note we saved in zip file) from s3
unzip env-file.zip # unzip the zip file
cp .env.develop .env # copies the content of .env.develop file to a new file .env
rm .env.develop # removes (delete) the .env.develop file
sed -i -e "s|\(^REDIS_HOST=\).*|REDIS_HOST=redis://$ELASTICACHE_ENDPOINT:6379|g" .env # updates the value of REDIS_HOST in our .env file with the value of the ELASTICACHE_ENDPOINT (elasticache url in 18-elasticache.tf)
rm -rf env-file.zip # removes the zip file containing the .env file
cp .env .env.develop # copies the updated .env file to .env.develop
zip env-file.zip .env.develop # zip the new file .env.develop
aws --region us-east-1 s3 cp env-file.zip s3://chatlyapp-env-files/develop # copies the new env-file.zip to our s3 bucket
rm -rf .env* # removes all .env files left
rm -rf env-file.zip # remove env-file.zip

