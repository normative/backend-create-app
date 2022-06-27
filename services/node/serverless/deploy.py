#!/usr/bin/env python3
import argparse
import os

parser = argparse.ArgumentParser(description="")

group = parser.add_mutually_exclusive_group(required=True)

group.add_argument("--manual", help="Serverless.com deploy, including logs", action='store_true')
group.add_argument("--serverless", help="Serverless.com deploy", action='store_true')

args = parser.parse_args()

#Determining script file name
base_file = "scripts/deploy_"
file_postfix = "local"
if args.manual:
    file_postfix = "manual"
if args.serverless:
    file_postfix = "serverless"

# Generate graphql templates
script_templates_generate = "graphql_templates_generate.py"
script_schema_generate = "graphql_schema_generate.py"

os.system("cd scripts; chmod u+x %s %s; ./%s; ./%s" % (script_templates_generate, script_schema_generate, script_schema_generate, script_templates_generate))

# Deploy file
file_name = "%s%s.sh" % (base_file, file_postfix)
os.system("chmod u+x %s; ./%s" % (file_name, file_name))
