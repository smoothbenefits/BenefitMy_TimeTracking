#!/bin/bash

echo "Start npm install..."
sudo npm install

echo "Backup GIT ignore file..."
mv ./.gitignore ./.gitignore_backup

echo "Apply GIT ignore file for deployment..."
mv ./.gitignore_deploy ./.gitignore

echo "Running eb deploy..." 

echo "Resume GIT ignore file..."
mv ./.gitignore ./.gitignore_deploy
mv ./.gitignore_backup ./.gitignore
