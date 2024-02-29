---Indexation---

Prérequis :
-Installer mongodb
-Modifier les propriétés de ./Back/src/Config.json. (nb de livres, url mongoDb...)

Se mettre dans le dossier Back => cd Back
Lancer => npm install
Lancer => npx tsc
Lancer => node ./Back/dist/Index/App.js

---Api---
Lancer => ts-node --esm ./Back/src/Api/Server.ts 

---Front---
Se mettre dans le dossier Front => cd Front
Lancer => npm install
Lancer => npm run dev