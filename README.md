# Système de connexion sécurisé

## Objectif
Créer un formulaire de connexion avec validation du mot de passe, protection brute force, et hash SHA-256 pour la sécurité.

## Fonctionnalités
- Validation du mot de passe (longueur ≥8, majuscule, chiffre)
- Blocage après 3 tentatives
- Hash SHA-256 du mot de passe
- Messages sécurisés

## Technologies
- HTML / CSS / JavaScript
- Web Crypto API pour le hash

## Test
1. Ouvrir `index.html` dans un navigateur
2. Entrer un mot de passe faible → message rouge
3. Entrer un mot de passe fort → message vert et hash affiché dans la console
4. Après 4 tentatives incorrectes → blocage temporaire de 30 secondes

