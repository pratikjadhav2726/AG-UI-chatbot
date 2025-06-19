#!/bin/bash

# Docker wrapper script to run docker commands without sudo
# This script uses the docker group membership

# Check if user is in docker group
if groups | grep -q docker; then
    # User is in docker group, run docker directly
    docker "$@"
elif getent group docker | grep -q "$(whoami)"; then
    # User is in docker group but needs to apply group membership
    sg docker -c "docker $*"
else
    # User not in docker group, use sudo
    echo "Warning: User not in docker group, using sudo"
    sudo docker "$@"
fi
