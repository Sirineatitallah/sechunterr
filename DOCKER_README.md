# VOC Security Project - Docker Setup

Ce document fournit des instructions pour exécuter le projet VOC Security à l'aide de Docker.

## Prérequis

- Docker installé sur votre machine
- Docker Compose installé sur votre machine
- Node.js et npm installés pour la construction de l'application Angular

## Exécution de l'application avec Docker

### Construction et dockerisation de l'application

Nous avons fourni des scripts pour construire l'application Angular et créer une image Docker :

#### Windows (PowerShell) :

```powershell
# Construire l'application Angular et créer l'image Docker
.\build-and-dockerize.ps1
```

#### Linux/macOS (Bash) :

```bash
# Rendre le script exécutable
chmod +x build-and-dockerize.sh

# Construire l'application Angular et créer l'image Docker
./build-and-dockerize.sh
```

### Démarrage et arrêt du conteneur

Après avoir construit l'image Docker, vous pouvez utiliser les scripts suivants pour gérer le conteneur :

#### Windows (PowerShell) :

```powershell
# Démarrer le conteneur
.\start-docker.ps1

# Arrêter le conteneur
.\stop-docker.ps1
```

#### Linux/macOS (Bash) :

```bash
# Rendre les scripts exécutables
chmod +x start-docker.sh
chmod +x stop-docker.sh

# Démarrer le conteneur
./start-docker.sh

# Arrêter le conteneur
./stop-docker.sh
```

### Accès à l'application

Une fois que le conteneur est en cours d'exécution, vous pouvez accéder à l'application à l'adresse :

```
http://localhost:8080
```

## Dépannage

### Problèmes de construction

Si vous rencontrez des problèmes lors du processus de construction :

1. Assurez-vous que Node.js et npm sont installés
2. Vérifiez que toutes les dépendances sont installées avec `npm install`
3. Essayez de construire l'application Angular manuellement avec `npm run build`
4. Vérifiez s'il y a des erreurs dans la sortie de construction

### Conteneur ne démarrant pas

Si le conteneur ne démarre pas, vérifiez les journaux :

```bash
docker-compose -f sechunter/docker-compose.yml logs
```

### Application non accessible

Si vous ne pouvez pas accéder à l'application :
1. Vérifiez que le conteneur est en cours d'exécution : `docker ps`
2. Vérifiez si le port est correctement mappé : `docker port voc-frontend`
3. Inspectez les journaux du conteneur : `docker logs voc-frontend`
