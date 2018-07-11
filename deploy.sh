#!/usr/bin/env bash

rm -r dist
npm run build
git add .
git commit -m 'Deploy to Production'
git push origin master