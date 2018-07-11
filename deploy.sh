#!/usr/bin/env bash

rm -r dist
npm run build
git add .
git commit -m 'Deploy to Heroku'
git push origin master