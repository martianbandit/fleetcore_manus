# FAQ FleetCore

**Version 18.0** | **Foire aux questions**

---

## Table des matières

1. [Questions générales](#1-questions-générales)
2. [Véhicules et flotte](#2-véhicules-et-flotte)
3. [Inspections et rondes de sécurité](#3-inspections-et-rondes-de-sécurité)
4. [Fiches PEP et conformité SAAQ](#4-fiches-pep-et-conformité-saaq)
5. [FleetCommand (Bons de travail)](#5-fleetcommand-bons-de-travail)
6. [FleetCrew (Inventaire)](#6-fleetcrew-inventaire)
7. [Techniciens et équipes](#7-techniciens-et-équipes)
8. [Synchronisation et données](#8-synchronisation-et-données)
9. [Notifications et rappels](#9-notifications-et-rappels)
10. [Abonnements et facturation](#10-abonnements-et-facturation)
11. [Dépannage technique](#11-dépannage-technique)

---

## 1. Questions générales

### Qu'est-ce que FleetCore ?

FleetCore est une application mobile de gestion de flotte conçue pour les entreprises de transport au Québec. Elle permet de gérer les véhicules lourds, d'effectuer des inspections conformes aux exigences de la SAAQ, de suivre les bons de travail et de gérer l'inventaire de pièces. L'application fonctionne sur iOS, Android et navigateur web.

### Quels types de véhicules puis-je gérer avec FleetCore ?

FleetCore prend en charge tous les véhicules lourds soumis à la réglementation SAAQ, incluant les tracteurs routiers, les semi-remorques, les camions porteurs, les autobus et les véhicules d'urgence. L'application s'adapte automatiquement aux exigences d'inspection selon le type et le PNBV (Poids nominal brut du véhicule) de chaque véhicule.

### FleetCore est-il conforme aux exigences de la SAAQ ?

Oui, FleetCore intègre l'ensemble des exigences réglementaires de la SAAQ pour l'entretien préventif des véhicules lourds. L'application utilise le Guide de vérification mécanique officiel avec ses 420 défauts classifiés, les codes VMRS standardisés et le formulaire PEP 6609-30 conforme aux 12 sections officielles.

### Combien d'utilisateurs peuvent accéder à FleetCore ?

Le nombre d'utilisateurs dépend de votre plan d'abonnement. Le plan Free permet jusqu'à 2 utilisateurs, le plan Plus jusqu'à 10 utilisateurs, le plan Pro jusqu'à 50 utilisateurs, et le plan Entreprise offre un nombre illimité d'utilisateurs.

### FleetCore fonctionne-t-il sans connexion internet ?

Oui, FleetCore fonctionne en mode hors-ligne grâce au stockage local. Vous pouvez effectuer des inspections, créer des bons de travail et consulter les données de vos véhicules même sans connexion. Les données sont automatiquement synchronisées dès que la connexion réseau est rétablie.

---

## 2. Véhicules et flotte

### Comment ajouter un nouveau véhicule ?

Pour ajouter un véhicule, accédez à l'onglet **Véhicules** et appuyez sur le bouton **+ Ajouter**. Renseignez les informations obligatoires (numéro d'unité, plaque, NIV, marque, modèle, année, type) et optionnelles (PNBV, odomètre, photo). Validez en appuyant sur **Enregistrer**.

### Puis-je importer ma liste de véhicules existante ?

Actuellement, l'import en masse de véhicules n'est pas disponible dans l'application mobile. Pour les flottes importantes, contactez le support FleetCore qui peut vous assister dans l'import initial de vos données via l'API (plan Entreprise requis).

### Comment modifier les informations d'un véhicule ?

Ouvrez la fiche du véhicule concerné depuis l'onglet **Véhicules**, puis appuyez sur le bouton **Modifier** en haut à droite. Effectuez vos modifications et validez en appuyant sur **Enregistrer**.

### Comment supprimer un véhicule ?

La suppression d'un véhicule s'effectue depuis sa fiche détaillée en appuyant sur le bouton **Supprimer**. Une confirmation est demandée avant la suppression définitive. L'historique des inspections et documents associés est archivé.

### Que signifient les différents statuts de véhicule ?

| Statut | Signification |
|--------|---------------|
| **Actif** | Véhicule en service, conforme aux exigences |
| **Maintenance** | Véhicule en cours de réparation |
| **Inactif** | Véhicule hors service (vendu, accidenté, etc.) |
| **Bloqué** | Véhicule avec défaut majeur, circulation interdite |

### Comment assigner un technicien à un véhicule ?

Depuis la fiche du véhicule, faites défiler jusqu'à la section **Techniciens assignés** et appuyez sur **Gérer**. Vous pouvez alors sélectionner un ou plusieurs techniciens individuels ou assigner une équipe entière au véhicule.

---

## 3. Inspections et rondes de sécurité

### Quelle est la différence entre une ronde de sécurité et une inspection périodique ?

La **ronde de sécurité** est une vérification rapide (15-20 minutes) effectuée par le conducteur avant chaque départ. Elle couvre les éléments essentiels de sécurité. L'**inspection périodique** est une vérification approfondie (45-60 minutes) réalisée par un technicien qualifié selon un calendrier défini.

### Comment créer une nouvelle inspection ?

Accédez à l'onglet **Inspections** et appuyez sur **+ Nouvelle**. Sélectionnez le véhicule à inspecter, choisissez le type d'inspection (ronde de sécurité, périodique, complète), puis appuyez sur **Démarrer**.

### Comment documenter un défaut lors d'une inspection ?

Lorsque vous détectez un défaut, sélectionnez le niveau de gravité (mineur ou majeur), puis appuyez sur l'icône caméra pour prendre une photo. Vous pouvez ajouter des notes complémentaires et sélectionner le code VMRS correspondant pour une identification précise.

### Quelle est la différence entre un défaut mineur et un défaut majeur ?

| Type | Définition | Conséquence |
|------|------------|-------------|
| **Défaut mineur** | Anomalie n'affectant pas la sécurité immédiate | Le véhicule peut circuler, réparation planifiée |
| **Défaut majeur** | Défaut compromettant la sécurité | Circulation interdite jusqu'à réparation |

### Puis-je modifier une inspection après l'avoir terminée ?

Non, une fois terminée, l'inspection est verrouillée pour garantir l'intégrité des données et la conformité réglementaire. Si vous avez fait une erreur, vous devez créer une nouvelle inspection.

### Comment générer un rapport PDF d'inspection ?

Depuis la fiche de l'inspection complétée, appuyez sur le bouton **Générer PDF**. Le rapport conforme au format SAAQ sera généré et pourra être partagé par email ou imprimé.

### Combien de temps sont conservées les inspections ?

Les inspections sont conservées indéfiniment dans FleetCore. Selon la réglementation SAAQ, vous devez conserver les rapports d'inspection pendant au moins 2 ans. FleetCore archive automatiquement toutes les données pour répondre à cette exigence.

---

## 4. Fiches PEP et conformité SAAQ

### Qu'est-ce qu'une fiche PEP ?

La fiche PEP (Programme d'entretien préventif) est un document réglementaire exigé par la SAAQ pour les véhicules lourds. Elle atteste que le véhicule a été inspecté selon les normes en vigueur et qu'il est apte à circuler en toute sécurité.

### À quelle fréquence dois-je effectuer une fiche PEP ?

La fréquence dépend du PNBV (Poids nominal brut du véhicule) :

| PNBV | Fréquence | Exemples de véhicules |
|------|-----------|----------------------|
| > 4 500 kg | Tous les 3 mois | Tracteurs routiers, autobus |
| ≤ 4 500 kg | Tous les 6 mois | Camions légers, remorques |

### Les fiches PEP sont-elles disponibles pour tous les plans ?

Non, les fiches PEP sont une fonctionnalité premium disponible uniquement pour les plans **Plus**, **Pro** et **Entreprise**. Les utilisateurs du plan Free peuvent effectuer des inspections standard mais n'ont pas accès au formulaire PEP conforme SAAQ.

### Comment créer une fiche PEP ?

Accédez à **Dashboard > Fiches PEP** et appuyez sur **+ Nouvelle fiche PEP**. Sélectionnez le véhicule, complétez les 12 sections du formulaire, utilisez le diagramme de localisation pour les pneus et freins, puis signez électroniquement le document.

### Le formulaire PEP de FleetCore est-il accepté par la SAAQ ?

Oui, le formulaire PEP de FleetCore est conforme au modèle officiel 6609-30 de la SAAQ. Il contient toutes les sections requises et peut être présenté lors d'un contrôle routier ou d'un audit.

### Comment fonctionne le diagramme de localisation des défauts ?

Le diagramme de localisation affiche une vue de dessus du véhicule avec des positions numérotées (1 à 19). Lorsque vous détectez un défaut sur un pneu, un frein ou un essieu, sélectionnez la position correspondante sur le diagramme pour une identification précise.

---

## 5. FleetCommand (Bons de travail)

### Qu'est-ce que FleetCommand ?

FleetCommand est le module de gestion des bons de travail de FleetCore. Il permet de planifier, assigner et suivre les interventions de maintenance sur les véhicules de la flotte. Ce module est disponible pour les plans **Pro** et **Entreprise**.

### Comment créer un bon de travail ?

Accédez à **Dashboard > FleetCommand** et appuyez sur **+ Nouveau**. Renseignez le véhicule concerné, le type d'intervention, la priorité, la description du travail, le technicien assigné et la date limite.

### Les bons de travail sont-ils créés automatiquement après une inspection ?

Oui, lorsqu'une inspection détecte des défauts, FleetCore peut créer automatiquement un bon de travail avec les informations du défaut. Cette fonctionnalité peut être activée ou désactivée dans les paramètres.

### Comment utiliser le chronomètre de temps de travail ?

Depuis la fiche du bon de travail, appuyez sur **Démarrer** pour lancer le chronomètre lorsque vous commencez l'intervention. Appuyez sur **Pause** lors des interruptions et sur **Arrêter** à la fin du travail. Le temps total est automatiquement enregistré.

### Comment ajouter des pièces utilisées à un bon de travail ?

Depuis la fiche du bon de travail, appuyez sur **+ Ajouter des pièces**. Recherchez la pièce dans l'inventaire FleetCrew, sélectionnez la quantité utilisée et validez. Le stock est automatiquement mis à jour.

### Quelles sont les différentes priorités des bons de travail ?

| Priorité | Délai recommandé | Cas d'usage |
|----------|------------------|-------------|
| **Urgente** | Immédiat | Défaut majeur, véhicule bloqué |
| **Haute** | 24-48 heures | Défaut affectant la sécurité |
| **Normale** | 1 semaine | Maintenance préventive |
| **Basse** | 2+ semaines | Améliorations, esthétique |

---

## 6. FleetCrew (Inventaire)

### Qu'est-ce que FleetCrew ?

FleetCrew est le module de gestion de l'inventaire de FleetCore. Il permet de suivre les pièces, outils et consommables nécessaires à la maintenance de la flotte. Ce module est disponible pour les plans **Pro** et **Entreprise**.

### Comment ajouter un article à l'inventaire ?

Accédez à **Dashboard > FleetCrew** et appuyez sur **+ Ajouter**. Renseignez le nom de l'article, la catégorie, la quantité, le prix unitaire, le seuil minimum et l'emplacement de stockage.

### Comment enregistrer une sortie de stock ?

Depuis la fiche de l'article, appuyez sur **Sortie de stock**. Indiquez la quantité prélevée et sélectionnez le bon de travail associé si applicable. La transaction est enregistrée dans l'historique.

### Comment être alerté lorsqu'un article est en stock bas ?

FleetCrew génère automatiquement une alerte lorsque la quantité d'un article passe sous le seuil minimum défini. Ces alertes apparaissent dans le Dashboard et peuvent déclencher des notifications push si activées.

### Quelles catégories d'articles sont disponibles ?

| Catégorie | Exemples |
|-----------|----------|
| Pièces | Filtres, plaquettes, courroies, joints |
| Outils | Clés, crics, équipements de diagnostic |
| Fluides | Huile moteur, liquide de frein, antigel |
| Pneus | Pneus neufs, pneus rechapés |
| Électrique | Batteries, ampoules, fusibles |
| Consommables | Gants, chiffons, produits de nettoyage |

---

## 7. Techniciens et équipes

### Comment ajouter un nouveau technicien ?

Accédez à **Paramètres > Administration > Techniciens** et appuyez sur **+ Nouveau**. Renseignez les informations personnelles, le rôle, les spécialités et l'équipe d'appartenance.

### Quels sont les différents rôles disponibles ?

| Rôle | Description | Niveau d'accès |
|------|-------------|----------------|
| **Admin** | Administrateur système | Accès complet |
| **Manager** | Gestionnaire de flotte | Gestion sans administration |
| **Technician** | Technicien mécanicien | Inspections et bons de travail |
| **Viewer** | Observateur | Consultation uniquement |

### Comment créer une équipe ?

Accédez à **Paramètres > Administration > Équipes** et appuyez sur **+ Nouvelle**. Définissez le nom de l'équipe, sa description, sa couleur distinctive et optionnellement un chef d'équipe.

### Comment modifier les permissions d'un rôle ?

Accédez à **Paramètres > Administration > Permissions**. Sélectionnez le rôle à modifier et activez ou désactivez les permissions pour chaque ressource (véhicules, inspections, bons de travail, etc.).

### Un technicien peut-il appartenir à plusieurs équipes ?

Non, dans la version actuelle de FleetCore, un technicien ne peut appartenir qu'à une seule équipe à la fois. Cependant, il peut être assigné à plusieurs véhicules individuellement.

---

## 8. Synchronisation et données

### Comment fonctionne la synchronisation des données ?

FleetCore synchronise automatiquement vos données avec le serveur lorsqu'une connexion réseau est disponible. L'indicateur de synchronisation dans l'en-tête du Dashboard affiche l'état actuel : **Synchronisé** (vert), **En cours** (jaune) ou **Hors-ligne** (gris).

### Mes données sont-elles sauvegardées ?

Oui, les données sont stockées localement sur votre appareil et synchronisées avec le serveur cloud de FleetCore. En cas de perte ou changement d'appareil, vous pouvez récupérer vos données en vous connectant avec votre compte.

### Comment exporter mes données ?

Accédez à **Paramètres > Données > Exporter**. Vous pouvez exporter vos véhicules, inspections, bons de travail et inventaire au format CSV ou JSON.

### Comment synchroniser FleetCore avec Google Calendar ?

Accédez à **Paramètres > Synchronisation calendrier** et connectez votre compte Google. Une fois activée, les rappels FleetCore seront créés comme événements dans votre agenda Google.

### Les données sont-elles sécurisées ?

Oui, FleetCore utilise le chiffrement pour protéger vos données lors de la synchronisation. Les données stockées localement sont également protégées par les mécanismes de sécurité de votre appareil.

---

## 9. Notifications et rappels

### Quels types de notifications puis-je recevoir ?

| Type | Description |
|------|-------------|
| Inspection due | Rappel d'inspection à effectuer |
| Défaut majeur | Alerte immédiate pour défaut critique |
| Bon de travail urgent | Intervention prioritaire assignée |
| Document expirant | Assurance, immatriculation à renouveler |
| Fiche PEP due | Entretien préventif à planifier |
| Stock bas | Article d'inventaire à commander |

### Comment configurer les notifications ?

Accédez à **Paramètres > Notifications** pour activer ou désactiver chaque type de notification. Vous pouvez également définir les délais de rappel (par exemple, 14, 7 et 1 jour avant l'échéance).

### Comment créer un rappel personnalisé ?

Accédez à **Dashboard > Rappels** et appuyez sur **+ Nouveau**. Sélectionnez le véhicule concerné (optionnel), définissez la date d'échéance, le type de rappel et la priorité.

### Les rappels sont-ils synchronisés avec mon calendrier ?

Oui, si vous avez activé la synchronisation Google Calendar dans les paramètres, tous vos rappels FleetCore apparaîtront comme événements dans votre agenda Google.

### Comment désactiver toutes les notifications ?

Accédez à **Paramètres > Notifications** et désactivez l'option **Activer les notifications**. Vous pouvez également désactiver les notifications pour FleetCore dans les paramètres de votre appareil.

---

## 10. Abonnements et facturation

### Quels sont les différents plans disponibles ?

| Plan | Prix | Véhicules | Utilisateurs | Fonctionnalités clés |
|------|------|-----------|--------------|----------------------|
| **Free** | Gratuit | 5 | 2 | Inspections de base, Dashboard |
| **Plus** | 29 $/mois | 25 | 10 | + Fiches PEP, Google Calendar |
| **Pro** | 79 $/mois | 100 | 50 | + FleetCommand, FleetCrew |
| **Entreprise** | Sur devis | Illimité | Illimité | + API, Multi-sites, Support dédié |

### Comment changer de plan d'abonnement ?

Accédez à **Paramètres > Abonnement** et sélectionnez le plan souhaité. La mise à niveau est effective immédiatement. Pour passer au plan Entreprise, contactez l'équipe commerciale.

### Puis-je essayer les fonctionnalités premium gratuitement ?

Oui, FleetCore propose une période d'essai de 14 jours pour les plans Plus et Pro. Pendant cette période, vous avez accès à toutes les fonctionnalités du plan choisi sans engagement.

### Comment annuler mon abonnement ?

Accédez à **Paramètres > Abonnement** et appuyez sur **Annuler l'abonnement**. Votre compte passera automatiquement au plan Free à la fin de la période de facturation en cours.

### Que se passe-t-il si je dépasse la limite de véhicules de mon plan ?

Vous ne pourrez pas ajouter de nouveaux véhicules tant que vous n'aurez pas mis à niveau votre plan ou supprimé des véhicules existants. Les véhicules déjà enregistrés restent accessibles.

### Les prix incluent-ils les taxes ?

Les prix affichés sont hors taxes. Les taxes applicables (TPS/TVQ au Québec) seront ajoutées lors de la facturation.

---

## 11. Dépannage technique

### L'application ne se lance pas, que faire ?

Essayez les étapes suivantes dans l'ordre :
1. Fermez complètement l'application et relancez-la
2. Redémarrez votre appareil
3. Vérifiez que vous disposez de la dernière version de l'application
4. Désinstallez et réinstallez l'application (vos données seront récupérées après connexion)

### Je ne reçois pas les notifications, que faire ?

Vérifiez les points suivants :
1. Les notifications sont activées dans **Paramètres > Notifications**
2. Les notifications FleetCore sont autorisées dans les paramètres de votre appareil
3. Le mode "Ne pas déranger" n'est pas activé sur votre appareil

### La synchronisation ne fonctionne pas, que faire ?

Vérifiez les points suivants :
1. Votre appareil est connecté à internet (WiFi ou données mobiles)
2. L'indicateur de synchronisation n'affiche pas d'erreur
3. Essayez de forcer la synchronisation en tirant vers le bas sur l'écran principal

### J'ai perdu mes données, comment les récupérer ?

Si vous étiez connecté avec votre compte FleetCore, vos données sont sauvegardées sur le serveur. Connectez-vous simplement avec le même compte sur votre nouvel appareil pour récupérer vos données.

### L'application est lente, comment l'optimiser ?

Essayez les solutions suivantes :
1. Fermez les autres applications en arrière-plan
2. Libérez de l'espace de stockage sur votre appareil
3. Vérifiez que vous disposez d'une connexion internet stable
4. Mettez à jour l'application vers la dernière version

### Comment signaler un bug ou suggérer une amélioration ?

Contactez le support FleetCore par email à support@fleetcore.app en décrivant le problème rencontré ou votre suggestion. Incluez si possible des captures d'écran et les étapes pour reproduire le problème.

### L'application consomme beaucoup de batterie, est-ce normal ?

FleetCore est optimisé pour minimiser la consommation de batterie. Si vous constatez une consommation excessive, vérifiez que la synchronisation en arrière-plan n'est pas bloquée (ce qui peut causer des tentatives répétées) et que vous utilisez la dernière version de l'application.

---

## Vous n'avez pas trouvé votre réponse ?

Si votre question n'est pas couverte par cette FAQ, plusieurs options s'offrent à vous :

| Canal | Contact | Délai de réponse |
|-------|---------|------------------|
| Email | support@fleetcore.app | 24-48 heures |
| Documentation | docs.fleetcore.app | Immédiat |
| Chat en ligne | Disponible dans l'application (plans Pro+) | Temps réel |

---

**Document rédigé par Manus AI pour FleetCore v18.0**
