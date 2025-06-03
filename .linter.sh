#!/bin/bash
cd /home/kavia/workspace/code-generation/quizgenie-105586-b52aa4f2/quizgenie
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

