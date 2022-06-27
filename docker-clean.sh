#!/bin/sh
if [[ $( uname -a | awk '{print $1}' ) == 'Darwin' ]]; then #MacOS
    if !(ps -ax | grep /Applications/Docker.app/Contents/MacOS/com.docker | grep -v grep > /dev/null)
    then
      echo "Opening Docker";
      open -a docker;
    fi

    until (ps -ax | grep /Applications/Docker.app/Contents/MacOS/com.docker | grep -v grep > /dev/null)
    do
      echo "...";
      sleep 40s;
    done
else #Linux
  sudo service docker start;
fi

docker-compose down;

echo "Stopping and removing containers:"
! (docker container ls -aq) || (docker container stop $( docker container ls -aq )) &> /dev/null;
! (docker container ls -aq) || (docker container rm $( docker container ls -aq )) &> /dev/null;
! (docker container ls -aq) || (docker container rm $( docker container ls -aq )) &> /dev/null;

echo "Removing volumes:"
! (docker volume ls -q) || (docker volume rm $( docker volume ls -q )) &> /dev/null;
! (docker volume ls -q) || (docker volume rm $( docker volume ls -q )) &> /dev/null;

echo "Removing images:"
get_image_ids(){
  docker image ls -a | grep -v "^bitnami/mongodb" | grep -v "^node" | grep -v "^postgres" | grep -v "^envoyproxy/envoy-alpine" | grep -v "^redislabs/redisgraph" | grep -v "^neo4j" | awk 'NR>1{print $3}'
}

! (docker image ls -aq) || ! (get_image_ids) || (docker image rm -f $( get_image_ids )) &> /dev/null;
! (docker image ls -aq) || ! (get_image_ids) || (docker image rm -f $( get_image_ids )) &> /dev/null;
! (docker image ls -aq) || ! (get_image_ids) || (docker image rm -f $( get_image_ids )) &> /dev/null;
