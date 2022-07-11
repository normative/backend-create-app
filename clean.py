#!/usr/bin/env python3
import argparse
import os.path
import yaml
import json
from subprocess import run

base_filename = os.path.basename(__file__)
volumes_dir = './volumes'
volumes_dir_full = os.path.realpath(volumes_dir)

parser = argparse.ArgumentParser(description="Docker Local Clean")

parser.add_argument("-dc", "--dockercomposefile", default="docker-compose.yml", help="Docker Compose file name")
parser.add_argument("-a", "--all", action="store_true", default=False)
parser.add_argument("--remove-containers", action="store_true", default=False, help="Remove containers")
parser.add_argument("--remove-images", action="store_true", default=False, help="Remove containers")
parser.add_argument("--remove-volumes", action="store_true", default=False, help="Remove volumes")

args = parser.parse_args()
(docker_compose_filename, remove_containers, remove_images, remove_volumes, remove_all) = (args.dockercomposefile, args.remove_containers, args.remove_images, args.remove_volumes, args.all)

if remove_all:
    (remove_containers, remove_images, remove_volumes) = (True, True, True)

if remove_images and not remove_containers:
    raise IOError("%s: Cannot remove images without removing containers: --remove-images requires --remove-containers" % base_filename)

if not remove_containers and not remove_images and not remove_volumes and not remove_all:
    raise IOError("%s: No options specified. Run %s --help for options" % (base_filename, base_filename))

if not os.path.exists(docker_compose_filename):
    raise IOError("%s: Specified docker-compose file cannot be found: %s" % (base_filename, docker_compose_filename))


docker_compose_data = None
with open(docker_compose_filename, 'r') as file:
    docker_compose_data = yaml.safe_load(file)

docker_compose_filename_full = os.path.realpath(docker_compose_filename)
docker_compose_dirname_full = os.path.dirname(docker_compose_filename_full)

services = {}
for service_name in docker_compose_data["services"]:
    service_data = docker_compose_data["services"][service_name]

    #Getting list of volumes for service
    volumes = service_data["volumes"]
    curr_volumes = []
    for volume in volumes:
        if volume.startswith(volumes_dir):
            curr_volume = volume.split(":")[0]
            curr_volumes.append(os.path.realpath(curr_volume))
    curr_volumes.sort()

    curr_service = {"image": service_data["image"], "volumes": curr_volumes, "name": service_name}

    #Reading through dockerfile. Getting baseimage
    curr_service["dockerfile"] = None
    if "build" in service_data and "dockerfile" in service_data["build"]:
        dockerfile_context = (os.getcwd(), service_data["build"]["context"])["context" in service_data["build"]]
        dockerfile_name = service_data["build"]["dockerfile"]

        curr_dockerfilename = os.path.normpath(os.path.join(docker_compose_dirname_full, dockerfile_context, dockerfile_name))
        if not os.path.exists(curr_dockerfilename):
            raise IOError("%s: Dockerfile: %s, in directory: %s, relative to docker-compose file: %s, not found at %s" % (base_filename, dockerfile_name, dockerfile_context, os.path.realpath(docker_compose_filename), curr_dockerfilename))

        dockerfile_from_found = False
        dockerfile_base_image = None
        for line in open(curr_dockerfilename, 'r'):
            line = line.strip()

            if line.startswith("FROM"):
                dockerfile_from_found = True
                dockerfile_base_image = line.split(" ")[1]

                break
        curr_service["dockerfile"] = {"filename": curr_dockerfilename, "baseimage": dockerfile_base_image}
    if "build" not in service_data:
        curr_service["dockerfile"] = {"filename": None, "baseimage": curr_service["image"]}

    services[service_name] = curr_service

p = run(['docker', 'container', 'ls', '-a'], capture_output=True)
(returnCode, stdout, stderr) = (p.returncode, p.stdout.decode(), p.stderr.decode())

for container in stdout.split("\n")[1:]:
    container_parts = list(filter(lambda x: x != '', container.split(' ')))

    if not len(container_parts):
        continue

    container_id = container_parts[0]
    p_inner = run(['docker', 'inspect', container_id], capture_output=True)
    (returnCodeInner, stdoutInner, stderrInner) = (p_inner.returncode, p_inner.stdout.decode(), p_inner.stderr.decode())

    container_dict = json.loads(stdoutInner)

    container_config = container_dict[0]["Config"]
    container_labels = container_config["Labels"]

    if "com.docker.compose.project.config_files" not in container_labels:
        continue

    container_docker_compose_filename = container_labels["com.docker.compose.project.config_files"]

    if container_docker_compose_filename != docker_compose_filename_full:
        continue

    container_docker_compose_service = container_labels["com.docker.compose.service"]

    container_image = "sha256:".join(container_labels["com.docker.compose.image"].split("sha256:")[1:]) if "com.docker.compose.image" in container_labels else None
    container_name = container_dict[0]["Name"][1:]
    container_volumes = [container_volume["Source"] for container_volume in container_dict[0]["Mounts"] if container_volume["Source"].startswith(volumes_dir_full)]
    container_volumes.sort()

    for service_name in services:
        service = services[service_name]

        if service_name == container_docker_compose_service:
            services[service_name]["image_id"] = container_image

            break

for service_name in services:
    curr_service = services[service_name]

    print(curr_service)
