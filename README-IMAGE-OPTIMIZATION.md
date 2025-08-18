Ce script optimise les images du dépôt et génère des copies compressées dans `optimized-images/` (sans écraser les originaux). Il crée aussi des versions WebP.

Utilisation :

1) Installer les dépendances :

   npm install

2) Lancer l'optimisation :

   npm run optimize-images

Résultat :

- Dossier `optimized-images/` créé à la racine du dépôt
- Images JPEG/PNG compressées et versions `.webp`

Remarques :
- Les images originales ne sont pas modifiées.
- Ajustez la qualité dans `scripts/optimize-images.js` si vous voulez plus/moins de compression.
