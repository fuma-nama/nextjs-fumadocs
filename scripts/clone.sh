#!/bin/sh

rm -rf next.js
mkdir next.js

cd next.js && git clone --no-checkout --depth=1 --filter=tree:0 https://github.com/vercel/next.js . && git sparse-checkout set --no-cone /docs && git checkout

rm -rf next.js/.git