#!/usr/bin/env python3
import argparse

#TODO: This needs to be explained, put into the new init script, etc
#TODO: The templates & the created files need to be in different locations
parser = argparse.ArgumentParser(description="Postman Generator")
parser.add_argument("-a", "--appname", help="App Name")
args = parser.parse_args()

app_name = args.appname

collection_filename="../tests/postman/templates/{APP_NAME}.postman_collection.json"
environment_filename="../tests/postman/templates/{APP_NAME}.postman_environment.json"

collection_filename_new=collection_filename.replace("templates/{APP_NAME}", app_name)
environment_filename_new=environment_filename.replace("templates/{APP_NAME}", app_name)

collection_file_new=open(collection_filename_new, "w+")

for line in open(collection_filename):
    line = line.replace("{APP_NAME}", app_name)
    collection_file_new.write(line)
collection_file_new.close()

environment_file_new=open(environment_filename_new, "w+")
for line in open(environment_filename):
    line = line.replace("{APP_NAME}", app_name)
    environment_file_new.write(line)
environment_file_new.close()
