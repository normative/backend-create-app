#!/usr/bin/env python3
import os
import argparse

parser = argparse.ArgumentParser(description="GraphQL Template Generator")
parser.add_argument("-s", "--stage", default="dev", help="Stage")
args = parser.parse_args()

stage_name = args.stage

appsync_template_filename = '../config/templates/serverless-appsync.template.yml'
appsync_generated_filename = '../config/envs/%s/serverless-appsync.yml' % stage_name
vpc_resources_template_filename = '../config/templates/serverless-vpc-resources.template.yml'
vpc_resources_generated_filename = '../config/envs/%s/serverless-vpc-resources.yml' % stage_name
datasources_generated_filename = '../config/envs/%s/serverless-appsync-datasources-generated.yml' % stage_name
datasource_template_filename = '../config/templates/serverless-appsync-datasource.template.yml'
mapping_templates_section_generated_filename = '../config/envs/%s/serverless-appsync-mapping-templates-section-generated.yml' % stage_name
mapping_template_section_filename = '../config/templates/serverless-appsync-mapping-template-section.template.yml'
request_mapping_template_filename = '../config/templates/serverless-appsync-request-mapping-template.template.txt'
response_mapping_template_filename = '../config/templates/serverless-appsync-response-mapping-template.template.txt'

schema_filename = '../models/graphql/schema.graphql'

functions_map = {"query": [], "mutation": [], "subscription": []}

# Creating serverless-appsync.STAGE_NAME.yml file
appsync_generated_file = open(appsync_generated_filename, 'w')
for line in open(appsync_template_filename):
    line_new = line.replace('{STAGE_NAME}', stage_name)\
        .replace('{STAGE_NAME_CAPITALIZED}', stage_name.capitalize())

    appsync_generated_file.write(line_new)
appsync_generated_file.close()

# Creating envs/STAGE_NAME/serverless-vpc-resources.yml file
vpc_resources_generated_file = open(vpc_resources_generated_filename, 'w')
for line in open(vpc_resources_template_filename):
    line_new = line.replace('{STAGE_NAME_CAPITALIZED}', stage_name.capitalize())

    vpc_resources_generated_file.write(line_new)
vpc_resources_generated_file.close()

# Going through schema
with open(schema_filename) as f:
    lines = f.readlines()

    queryStarted = False
    mutationStarted = False
    subscriptionStarted = False
    multilineCommentStarted = False
    for line in lines:
        line = line.strip()

        if not len(line):
            continue

        # Skipping comments
        if line.startswith('#'):
            continue
        if line.startswith('"""'):
            multilineCommentStarted = False if multilineCommentStarted else True
            continue
        if multilineCommentStarted:
            continue

        # Skipping directives
        if line.startswith('@'):
            continue

        # Checking for Query section
        if line.startswith('type Query'):
            queryStarted = True
            continue
        if queryStarted and line.startswith('}'):
            queryStarted = False

        # Checking for Mutation section
        if line.startswith('type Mutation'):
            mutationStarted = True
            continue
        if mutationStarted and line.startswith('}'):
            mutationStarted = False

        # Checking for Mutation section
        if line.startswith('type Subscription'):
            subscriptionStarted = True
            continue
        if subscriptionStarted and line.startswith('}'):
            subscriptionStarted = False

        # query, mutation & subscription append
        function_name = line.split('(')[0].split(':')[0].strip()
        function_name = function_name[0].capitalize() + function_name[1:]
        if queryStarted:
            functions_map["query"].append('query' + function_name)
        if mutationStarted:
            functions_map["mutation"].append('mutation' + function_name)
        if subscriptionStarted:
            #functions_map["subscription"].append('subscription' + function_name)
            continue

# Removing current mapping templates
mapping_templates_dir = '../mapping-templates/graphql'
for _filename in os.listdir(mapping_templates_dir):
    os.remove(os.path.join(mapping_templates_dir, _filename))

templates = [
    {'templateFileName': datasource_template_filename, 'generatedFileName': datasources_generated_filename, 'isGeneratedFileName': False, 'skipFirstLine': True, 'appendSections': True, 'firstLine': 'dataSources:'},
    {'templateFileName': mapping_template_section_filename, 'generatedFileName': mapping_templates_section_generated_filename, "isGeneratedFileName": False, "skipFirstLine": False, "appendSections": True, 'firstLine': 'mappingTemplates:'},
    {'templateFileName': response_mapping_template_filename, 'generatedFileName': '../mapping-templates/graphql/{FUNCTION_TYPE}_{FUNCTION_NAME_ORIG}-response-mapping-template-generated.txt', "isGeneratedFileName": True, "skipFirstLine": False, "appendSections": False},
    {'templateFileName': request_mapping_template_filename, 'generatedFileName': '../mapping-templates/graphql/{FUNCTION_TYPE}_{FUNCTION_NAME_ORIG}-request-mapping-template-generated.txt', "isGeneratedFileName": True, "skipFirstLine": False, "appendSections": False}
]

# Removing non-generated-filename files, insertimg firstLines if applicable
for template in templates:
    if not template['isGeneratedFileName'] and template['appendSections']:
        if os.path.exists(template['generatedFileName']):
            os.remove(template['generatedFileName'])

        if 'firstLine' in template:
            f = open(template['generatedFileName'], 'w+')
            f.write('%s\n' % template['firstLine'])
            f.close()

for function_type in functions_map:
    function_type_titled = function_type[0].upper() + function_type[1:]

    for function_name in functions_map[function_type]:
        function_name_titled = function_name[0].upper() + function_name[1:]

        function_name_orig = function_type.join(function_name.split(function_type)[1:])
        function_name_orig = function_name_orig[0].lower() + function_name_orig[1:]

        request_template_name = 'graphql/%s_%s-request-mapping-template-generated.txt' % (function_type, function_name_orig)
        response_template_name = 'graphql/%s_%s-response-mapping-template-generated.txt' % (function_type, function_name_orig)

        for template in templates:
            generated_file_name = template['generatedFileName']

            if template['isGeneratedFileName']:
                generated_file_name = template['generatedFileName'].replace('{FUNCTION_NAME}', function_name)\
                    .replace('{FUNCTION_NAME_TITLED}', function_name_titled)\
                    .replace('{FUNCTION_TYPE}', function_type)\
                    .replace('{FUNCTION_TYPE_TITLED}', function_type_titled)\
                    .replace('{FUNCTION_NAME_ORIG}', function_name_orig)\
                    .replace('{FUNCTION_REQUEST_TEMPLATE_NAME}', request_template_name)\
                    .replace('{FUNCTION_RESPONSE_TEMPLATE_NAME}', response_template_name)\
                    .replace('{STAGE_NAME}', stage_name.capitalize())

                if not template['appendSections']:
                    if os.path.exists(generated_file_name):
                        os.remove(generated_file_name)
            generated_file = open(generated_file_name, 'a' if template['appendSections'] else 'w')

            with open(template['templateFileName']) as f:
                lines = f.readlines()

                i = 0
                for line in lines:
                    if template['skipFirstLine'] and i == 0:
                        i += 1
                        continue

                    line = line.rstrip()

                    # Skipping empty lines
                    if not len(line):
                        continue

                    line = line.replace('{FUNCTION_NAME}', function_name) \
                                .replace('{FUNCTION_NAME_TITLED}', function_name_titled)\
                                .replace('{FUNCTION_TYPE}', function_type)\
                                .replace('{FUNCTION_TYPE_TITLED}', function_type_titled)\
                                .replace('{FUNCTION_NAME_ORIG}', function_name_orig)\
                                .replace('{FUNCTION_REQUEST_TEMPLATE_NAME}', request_template_name)\
                                .replace('{FUNCTION_RESPONSE_TEMPLATE_NAME}', response_template_name) \
                                .replace('{STAGE_NAME}', stage_name.capitalize())
                    generated_file.write('%s\n' % line)
            generated_file.close()
