#!/bin/bash

rm -rf docs
pnpm run build
mv build docs
