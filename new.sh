#!/bin/bash
# الخطوات الصحيحة للرفع
clip < ~/.ssh/id_ed25519.pubgit add .
git commit -m "update files"
git branch -M main
git push -u origin main