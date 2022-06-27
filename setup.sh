#!/usr/bin/env bash
if [[ $( uname -a | awk '{print $1}' ) == 'Darwin' ]]; then #MacOS-only
  if !(ps -ax | grep /Applications/Docker.app/Contents/MacOS/com.docker | grep -v grep > /dev/null); then
      echo "Opening Docker";
      open -a docker;
    fi

  until (ps -ax | grep /Applications/Docker.app/Contents/MacOS/com.docker | grep -v grep > /dev/null); do
      echo "...";
      sleep 40s;
    done
else  #Linux
  sudo service docker start;
fi

#Cleaning docker
echo "Cleaning up docker...";
chmod u+x docker-clean.sh;
./docker-clean.sh;
./docker-clean.sh;

#Cleaning volumes
echo "Cleaning up on disk volumes...";
sudo rm -rf volumes;

#Setting up volumes(Linux)
if [ "$( uname -a | awk '{ print $1 }' )" == "Linux" ]; then
  mkdir -p volumes/mongo;
  chown 1001 volumes/mongo;
fi

#Setting up ssl keys
if [ "$( uname -a | awk '{ print $1 }' )" == "Darwin" ]; then
  if !(test -f "services/ingress/.localhost-ssl/localhost.crt") || !(test -f "services/ingress/.localhost-ssl/localhost.crt"); then
      echo "Setting up SSL keys: requires user password"
      cd services/ingress;
      chmod u+x ssl_setup_mac.sh;
      ./ssl_setup_mac.sh;
      cd ../..;
  fi
fi

#Setting up serverless deploy
chmod u+x services/node/serverless/deploy.py;
chmod u+x -R services/node/serverless/scripts;
