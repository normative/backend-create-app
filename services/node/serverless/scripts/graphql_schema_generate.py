#!/usr/bin/env python3
import os

sdl_dir = '../models/graphql/sdls'
sdl_main_filename = '../models/graphql/schema.graphql'
sdl_scalar_filename = 'scalars.graphql'

start_file_name = ''
end_file_name = ''
other_file_names = []
for _file in os.listdir(sdl_dir):
    if _file == sdl_scalar_filename:
        continue
    
    curr_file = os.path.join(sdl_dir, _file)

    for line in open(curr_file):
        line = line.strip()

        if line.startswith('type Query {'):
            start_file_name = curr_file
            break
        if line.startswith('type Schema {'):
            end_file_name = curr_file
            break
    if curr_file not in (start_file_name, end_file_name):
        other_file_names += [curr_file]

all_files = [start_file_name]
all_files.extend(other_file_names)

query_defs = 'type Query {\n'
mutation_defs = 'type Mutation {\n'
subscription_defs = 'type Subscription {\n'
schema_defs = """type Schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
}"""

other_defs = ''

for _file in all_files:
    subscription_started = False
    query_started = False
    mutation_started = False
    other_defs_started = True
    for line in open(_file):
        line_ = line.strip()

        if line_.startswith('type Query') or line_.startswith('extend type Query'):
            query_started = True
            other_defs_started = False

            continue
        elif line_.startswith('type Mutation') or line_.startswith('extend type Mutation'):
            mutation_started = True
            other_defs_started = False

            continue
        elif line_.startswith('type Subscription') or line_.startswith('extend type Subscription'):
            subscription_started = True
            other_defs_started = False

            continue
        elif line_.startswith('}'):
            if query_started:
                query_started = False

                continue
            elif mutation_started:
                mutation_started = False

                continue
            elif subscription_started:
                subscription_started = False

                continue

        if query_started:
            query_defs += line.rstrip() + '\n'
        elif mutation_started:
            mutation_defs += line.rstrip() + '\n'
        elif subscription_started:
            subscription_defs += line.rstrip() + '\n'
        elif other_defs_started:
            other_defs += line.rstrip() + '\n'
query_defs += '}\n'
mutation_defs += '}\n'
subscription_defs += '}\n'
other_defs += '\n'

# Writing final SDL definition
sdl_main_file = open(sdl_main_filename, 'w')

sdl_main_file.write(other_defs)
sdl_main_file.write(query_defs)
sdl_main_file.write(mutation_defs)
sdl_main_file.write(subscription_defs)
sdl_main_file.write(schema_defs)

sdl_main_file.close()
