---
title: "Comment gérer un blog statique"
date: "10 juin 2026"
description: "Gestion simple des articles et génération automatique de pages à partir de Markdown."
slug: "gerer-un-blog-sans-backend"
readingTime: "2 min de lecture"
---

Pour éviter de créer manuellement chaque page, on utilise un petit générateur local.

## Workflow recommandé

1. Écrire un article en Markdown dans <code>blog/posts/</code>
2. Lancer le script local pour générer les pages HTML
3. Vérifier le résultat dans le dossier <code>blog/</code>

## Pourquoi le générateur ?

- Il évite les erreurs de mise en forme
- Il permet d'ajouter un sommaire automatiquement
- Il garde la structure propre et homogène

## Astuce

N'utilise pas de back-end pour les articles : garde tout statique et génère-le localement avant chaque mise à jour.
