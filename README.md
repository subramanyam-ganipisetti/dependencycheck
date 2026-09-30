# DependencyCheck Demo

A small demo project created to test DependencyCheck software supply-chain security scanning.

## Purpose

This project intentionally contains older dependency versions so that DependencyCheck can:

- Build a dependency inventory
- Identify known vulnerabilities
- Detect direct dependencies
- Detect dependencies used in source code
- Calculate vulnerability priority
- Recommend remediation actions

## Project Structure

dependencycheck-demo/
├── package.json
├── src/
│   └── app.js
└── README.md

## Important

This is a security-scanning demonstration project.

The dependency versions are intentionally outdated and should not be used in production.

Do not deploy this application publicly.

## Run

npm install
npm start

The demo server runs on:

http://localhost:3001
