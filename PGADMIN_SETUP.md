# Configuration pgAdmin - Guide Complet

## Accès à pgAdmin

1. Ouvrir votre navigateur et aller à : **http://localhost:5050**

2. Se connecter avec les identifiants :
   - **Email** : `admin@admin.com`
   - **Mot de passe** : `admin_secure_password`

## Ajouter le serveur PostgreSQL

### Étape 1 : Créer un nouveau serveur
1. Clic droit sur "Servers" dans le panneau de gauche
2. Sélectionner "Register" → "Server..."

### Étape 2 : Onglet "General"
- **Name** : `PostgreSQL Docker` (ou tout autre nom de votre choix)

### Étape 3 : Onglet "Connection"
- **Host name/address** : `db` ⚠️ **IMPORTANT : Utiliser "db", pas "localhost"**
- **Port** : `5432`
- **Maintenance database** : `credit_dashboard`
- **Username** : `postgres`
- **Password** : `postgres`
- **Save password?** : ✅ Cocher pour éviter de retaper le mot de passe

### Étape 4 : Sauvegarder
Cliquer sur "Save" pour ajouter le serveur.

## Vérification de la connexion

Une fois connecté, vous devriez voir :
```
Servers
└── PostgreSQL Docker
    └── Databases
        └── credit_dashboard
            └── Schemas
                └── public
                    └── Tables
                        └── predictions (si des données ont été créées)
```

## Requêtes de test

### Vérifier la table predictions
```sql
SELECT * FROM predictions;
```

### Voir la structure de la table
```sql
\d predictions
```

### Insérer une donnée de test
```sql
INSERT INTO predictions (score, risk_level, input_data, applicant_id, loan_amount, purpose)
VALUES (750, 'LOW', '{"test": true}', 'TEST001', 50000, 'Test via pgAdmin');
```

### Vérifier l'insertion
```sql
SELECT * FROM predictions WHERE applicant_id = 'TEST001';
```

## Résolution des problèmes

### Erreur "could not connect to server"
- Vérifiez que le conteneur PostgreSQL est en cours d'exécution : `docker compose ps`
- Utilisez bien `db` comme nom d'hôte, pas `localhost`

### Erreur d'authentification
- Vérifiez les variables d'environnement dans le fichier `.env`
- Assurez-vous que POSTGRES_PASSWORD correspond au mot de passe utilisé

### Connexion lente
- C'est normal au premier démarrage, PostgreSQL initialise la base de données

## Commandes Docker utiles

```bash
# Voir les logs de PostgreSQL
docker compose logs db

# Voir les logs de pgAdmin
docker compose logs pgadmin

# Redémarrer seulement pgAdmin
docker compose restart pgadmin

# Accéder directement à PostgreSQL via CLI
docker compose exec db psql -U postgres -d credit_dashboard
```
