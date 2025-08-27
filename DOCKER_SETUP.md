# Configuration Docker Compose - Stack Complète

## Architecture de la Stack

Cette configuration Docker Compose orchestre 4 services :

1. **PostgreSQL** (port 5432) - Base de données avec volume persistant
2. **pgAdmin** (port 5050) - Interface web pour administrer PostgreSQL
3. **Backend FastAPI** (port 8000) - API de scoring
4. **Frontend React** (port 3000) - Dashboard avec proxy vers le backend

## Configuration et Démarrage

### 1. Préparer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos propres valeurs
# Changez au minimum POSTGRES_PASSWORD et PGADMIN_PASSWORD
```

### 2. Construire et lancer la stack

```bash
# Construire et démarrer tous les services
docker compose up --build

# Ou en arrière-plan
docker compose up --build -d
```

### 3. Vérifier que tout fonctionne

```bash
# Vérifier l'état des conteneurs
docker compose ps

# Vérifier les logs
docker compose logs backend --tail=50
docker compose logs db --tail=50
```

## Accès aux Services

- **Frontend React** : http://localhost:3000
- **Backend FastAPI** : http://localhost:8000
- **pgAdmin** : http://localhost:5050
- **PostgreSQL** : localhost:5432 (pour connexions directes)

## Configuration pgAdmin

1. Ouvrir http://localhost:5050
2. Se connecter avec :
   - Email : admin@admin.com (ou votre PGADMIN_EMAIL)
   - Mot de passe : admin_secure_password (ou votre PGADMIN_PASSWORD)

3. Ajouter un serveur PostgreSQL :
   - **Host** : `db` (nom du service Docker)
   - **Port** : `5432`
   - **Database** : `credit_dashboard`
   - **Username** : `postgres`
   - **Password** : votre POSTGRES_PASSWORD

## Résolution des Problèmes Courants

### Backend ne peut pas se connecter à la DB

```bash
# Vérifier que PostgreSQL est prêt
docker compose logs db

# Vérifier la variable DATABASE_URL dans le backend
docker compose exec backend env | grep DATABASE_URL
```

### Erreur "getaddrinfo ENOTFOUND"

- Vérifiez que tous les services sont sur le même réseau (`app-network`)
- Utilisez les noms de services Docker (`db`, `backend`) et non `localhost`

### Volumes et persistance

```bash
# Voir les volumes créés
docker volume ls

# Supprimer les volumes (ATTENTION : perte de données)
docker compose down -v
```

## Commandes Utiles

```bash
# Arrêter tous les services
docker compose down

# Reconstruire un service spécifique
docker compose build backend
docker compose up backend

# Voir les logs en temps réel
docker compose logs -f

# Accéder au shell d'un conteneur
docker compose exec backend sh
docker compose exec db psql -U postgres -d credit_dashboard

# Nettoyer complètement
docker compose down -v --rmi all
```

## Structure des Réseaux

Tous les services communiquent via le réseau `app-network` :
- Frontend → Backend : `http://backend:8000`
- Backend → Database : `postgresql://postgres:password@db:5432/credit_dashboard`
- pgAdmin → Database : `db:5432`
