#!/bin/bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps --no-audit --prefer-offline