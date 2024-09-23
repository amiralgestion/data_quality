#!/bin/bash

# Define the root directory of your project
ROOT_DIR=$(dirname "$(realpath "$0")")

# Function to list files and their contents
list_files() {
    local dir="$1"
    for file in "$dir"/*; do
        if [ -d "$file" ]; then
            # Skip __pycache__ directories
            if [[ "$(basename "$file")" == "__pycache__" ]]; then
                continue
            fi
            list_files "$file"
        elif [ -f "$file" ]; then
            echo "File: $file"
            echo "Content:"
            cat "$file"
            echo -e "\n\n"
        fi
    done
}

# Start listing from the root directory
list_files "$ROOT_DIR"