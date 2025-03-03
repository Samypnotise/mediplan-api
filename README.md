# API AdonisJS

Bienvenue dans le projet API AdonisJS ! Ce document vous guidera à travers les différentes étapes pour configurer, exécuter et contribuer à ce projet en utilisant `pnpm`.

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Démarrage](#démarrage)
- [Migration et Seeding](#migration-et-seeding)
- [Documentation Swagger](#documentation-swagger)
- [Structure du projet](#structure-du-projet)
- [Contribuer](#contribuer)
- [Licence](#licence)

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

- [Node.js](https://nodejs.org/) (version 14 ou supérieure)
- [pnpm](https://pnpm.io/)

## Installation

1. Installez les dépendances :

    ```bash
    pnpm install
    ```

## Démarrage

Pour démarrer le serveur de développement, exécutez la commande suivante :

```bash
pnpm dev
```
## Migration et Seeding
Lancez les migrations pour créer les tables dans la base de données :

> Assurez-vous d'avoir mis à jour les informations de connexion de la base de données dans le fichier `.env`

```bash
node ace migration:run
```
Seed la base de données avec des données initiales :
```bash
node ace db:seed
```
## Documentation Swagger
Pour lancer la documentation Swagger (avec Scalar), exécutez la commande suivante :

```bash
pnpm openapi
```
Cela générera la documentation Swagger que vous pourrez consulter à l'adresse suivante : http://localhost:8080/.
