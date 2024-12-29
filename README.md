# bun-mail-service

## Contexte

Ce projet est un service de messagerie qui permet d'envoyer des emails avec l'api Mailjet et possède un fallback vers Discord.

## Installation

Pour installer les dépendances :

```bash
bun install
```

Pour lancer le serveur :

```bash
bun run index.ts
```

## Configuration

Pour configurer le service, il faut renseigner les variables d'environnement suivantes :

```bash
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_NAME=

MAILJET_KEY=
MAILJET_SECRET=

WEBHOOK_ID=
WEBHOOK_TOKEN=
```
