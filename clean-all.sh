#!/bin/bash
docker container stop $( docker container ls -aq );
docker container rm $( docker container ls -aq );
docker image rm -f $( docker image ls -aq );
docker image rm -f $( docker image ls -aq );
docker volume rm $( docker volume ls -q );
docker system prune;
docker container stop $( docker container ls -aq );
docker container rm $( docker container ls -aq );
docker image rm -f $( docker image ls -aq );
docker image rm -f $( docker image ls -aq );
docker volume rm $( docker volume ls -q );
