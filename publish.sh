
#!/bin/bash
set -e

# Копіюємо весь вміст dist у корінь
cp -a dist/. .

# Додаємо зміни сайту, виключаючи файли шаблону
git add -A -- . \
  ':!.git' \
  ':!dist' \
  ':!src' \
  ':!node_modules' \
  ':!template_modules' \
  ':!package.json' \
  ':!package-lock.json' \
  ':!vite.config.js' \
  ':!template.config.js' \
  ':!docker-compose.yml' \
  ':!README.TXT' \
  ':!.vscode' \
  ':!.gitignore'

git status

# npm run build
# bash publish.sh
# git commit -m "Update website"
# git push origin master