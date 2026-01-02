# Guide Technicien FleetCore

**Version 18.0** | **Dernière mise à jour : Janvier 2026**

---

## Introduction

Ce guide s'adresse aux techniciens mécaniciens qui utilisent FleetCore pour réaliser les inspections de véhicules, compléter les bons de travail et gérer l'inventaire de pièces. En tant que technicien, vous êtes au cœur du processus de maintenance et votre travail garantit la sécurité et la conformité de la flotte.

FleetCore vous accompagne dans vos tâches quotidiennes grâce à des checklists interactives conformes aux exigences SAAQ, un système de documentation photographique et un suivi précis du temps de travail. Ce guide vous présente les fonctionnalités essentielles pour accomplir efficacement vos missions.

---

## 1. Prise en main

### 1.1 Connexion à l'application

Ouvrez l'application FleetCore sur votre appareil mobile (smartphone ou tablette). Connectez-vous avec les identifiants fournis par votre administrateur. Lors de la première connexion, vous serez invité à autoriser l'accès à la caméra et aux notifications.

### 1.2 Navigation principale

L'interface de FleetCore est organisée en quatre onglets principaux accessibles depuis la barre de navigation inférieure.

| Onglet | Fonction | Utilisation fréquente |
|--------|----------|----------------------|
| **Tableau de bord** | Vue d'ensemble et alertes | Début de journée |
| **Véhicules** | Liste et fiches véhicules | Consultation |
| **Inspections** | Liste et création d'inspections | Travail quotidien |
| **Paramètres** | Préférences personnelles | Occasionnel |

### 1.3 Votre profil

Votre profil technicien affiche vos informations personnelles, vos spécialités et vos statistiques de performance. Accédez-y depuis **Paramètres > Administration > Techniciens** puis sélectionnez votre nom.

| Information | Description |
|-------------|-------------|
| Spécialités | Domaines de compétence (moteur, freins, électrique, etc.) |
| Équipe | Groupe de travail assigné |
| Certifications | Qualifications professionnelles |
| Statistiques | Inspections réalisées, temps moyen, défauts détectés |

---

## 2. Réaliser une inspection

### 2.1 Démarrer une inspection

Pour créer une nouvelle inspection, suivez ces étapes :

1. Accédez à l'onglet **Inspections**
2. Appuyez sur le bouton **+ Nouvelle inspection**
3. Sélectionnez le véhicule à inspecter dans la liste
4. Choisissez le type d'inspection (ronde de sécurité, périodique, etc.)
5. Appuyez sur **Démarrer l'inspection**

### 2.2 Structure de la checklist

La checklist d'inspection est organisée en sections correspondant aux systèmes du véhicule. Chaque section contient plusieurs composants à vérifier.

| Section | Composants principaux |
|---------|----------------------|
| **1. Intérieur de la cabine** | Volant, pédales, instruments, ceintures |
| **2. Compartiment moteur** | Niveaux, courroies, durites, fuites |
| **3. Extérieur cabine** | Rétroviseurs, essuie-glaces, vitres |
| **4. Éclairage** | Phares, feux de position, clignotants |
| **5. Châssis et suspension** | Ressorts, amortisseurs, bras de suspension |
| **6. Direction** | Biellettes, rotules, boîtier de direction |
| **7. Système de freinage** | Disques, plaquettes, flexibles, ABS |
| **8. Roues et pneus** | Usure, pression, fixations |

### 2.3 Évaluation des composants

Pour chaque composant, sélectionnez l'état correspondant en appuyant sur le bouton approprié.

| État | Code | Signification | Action |
|------|------|---------------|--------|
| **Sans objet** | S/O | Composant non applicable | Passer au suivant |
| **Conforme** | C | Aucun défaut détecté | Valider |
| **Défaut mineur** | Min | Défaut n'affectant pas la sécurité | Documenter |
| **Défaut majeur** | Maj | Défaut compromettant la sécurité | Documenter + bloquer |

### 2.4 Documentation des défauts

Lorsque vous détectez un défaut (mineur ou majeur), FleetCore vous invite à le documenter.

**Étape 1 : Sélection du code VMRS**
Le système propose les codes VMRS correspondant au composant inspecté. Sélectionnez le code le plus précis pour identifier le défaut.

**Étape 2 : Localisation**
Utilisez le diagramme de localisation (positions 1 à 19) pour indiquer l'emplacement exact du défaut sur le véhicule.

**Étape 3 : Prise de photo**
Appuyez sur l'icône caméra pour photographier le défaut. La photo sera automatiquement associée à l'item de checklist et incluse dans le rapport.

**Étape 4 : Notes**
Ajoutez des remarques complémentaires si nécessaire (observations, recommandations, pièces à commander).

### 2.5 Finalisation de l'inspection

Une fois tous les composants vérifiés, appuyez sur **Terminer l'inspection**. FleetCore affiche un résumé avec le nombre de composants conformes, les défauts mineurs et majeurs détectés.

Si des défauts majeurs ont été identifiés, l'inspection sera marquée comme **Bloquée** et le véhicule ne pourra pas circuler tant que les réparations ne seront pas effectuées.

---

## 3. Fiches PEP (Entretien préventif)

### 3.1 Présentation

La fiche d'entretien préventif (PEP) est un document réglementaire exigé par la SAAQ pour les véhicules lourds. FleetCore propose un formulaire interactif conforme au modèle officiel 6609-30.

> **Note** : Cette fonctionnalité est disponible pour les plans Plus, Pro et Entreprise uniquement.

### 3.2 Fréquence des inspections PEP

La fréquence des inspections PEP dépend du PNBV (Poids nominal brut du véhicule).

| PNBV | Fréquence | Véhicules concernés |
|------|-----------|---------------------|
| > 4 500 kg | Tous les 3 mois | Tracteurs routiers, autobus |
| ≤ 4 500 kg | Tous les 6 mois | Camions légers, remorques |

### 3.3 Réalisation d'une fiche PEP

Pour créer une nouvelle fiche PEP :

1. Accédez à **Dashboard > Fiches PEP** (ou depuis le détail du véhicule)
2. Appuyez sur **+ Nouvelle fiche PEP**
3. Sélectionnez le véhicule concerné
4. Complétez les 12 sections du formulaire
5. Utilisez le diagramme de localisation pour les pneus et freins
6. Signez électroniquement le formulaire
7. Générez le PDF pour archivage

### 3.4 Sections de la fiche PEP

| Section | Composants vérifiés |
|---------|---------------------|
| 1. Identification | Informations du véhicule et du mécanicien |
| 2. Intérieur cabine | Commandes, instruments, sièges |
| 3. Compartiment moteur | Niveaux, fuites, courroies |
| 4. Extérieur | Carrosserie, rétroviseurs, vitrage |
| 5. Éclairage | Tous les dispositifs d'éclairage |
| 6. Châssis | Longerons, traverses, fixations |
| 7. Suspension | Ressorts, amortisseurs, bras |
| 8. Direction | Boîtier, biellettes, rotules |
| 9. Freins | Disques, tambours, flexibles, ABS |
| 10. Roues/pneus | Usure, pression, fixations |
| 11. Attelage | Sellette, kingpin, béquilles |
| 12. Accessoires | Extincteur, triangles, trousse |

### 3.5 Signature et génération PDF

Après avoir complété toutes les sections, accédez à l'écran de signature. Renseignez votre nom et numéro de mécanicien, puis signez électroniquement. Le PDF généré est conforme au format SAAQ et peut être imprimé ou envoyé par email.

---

## 4. Bons de travail

### 4.1 Consultation des bons assignés

Vos bons de travail assignés sont accessibles depuis **Dashboard > FleetCommand** ou via les notifications. Chaque bon de travail affiche les informations suivantes :

| Information | Description |
|-------------|-------------|
| Véhicule | Unité et plaque du véhicule concerné |
| Type | Réparation, maintenance préventive, rappel |
| Priorité | Urgente, haute, normale, basse |
| Description | Détail du travail à effectuer |
| Date limite | Échéance de réalisation |
| Coût estimé | Budget prévu |

### 4.2 Chronomètre de temps de travail

FleetCore intègre un chronomètre pour mesurer précisément le temps passé sur chaque intervention. Appuyez sur **Démarrer** lorsque vous commencez le travail et sur **Arrêter** lors des pauses ou à la fin de l'intervention.

Le temps total est automatiquement enregistré et visible dans l'historique du bon de travail. Cette information permet d'améliorer les estimations futures et d'optimiser la planification.

### 4.3 Sélection des pièces

Lors d'une intervention nécessitant des pièces de rechange, utilisez le sélecteur de pièces intégré :

1. Appuyez sur **+ Ajouter des pièces**
2. Recherchez la pièce dans l'inventaire FleetCrew
3. Sélectionnez la quantité utilisée
4. Validez la sélection

Le stock est automatiquement mis à jour et le coût des pièces ajouté au bon de travail.

### 4.4 Complétion du bon de travail

Une fois l'intervention terminée :

1. Arrêtez le chronomètre de temps de travail
2. Vérifiez la liste des pièces utilisées
3. Ajoutez des notes ou remarques si nécessaire
4. Appuyez sur **Marquer comme complété**

Le bon de travail passe au statut "Complété" et le gestionnaire est notifié.

---

## 5. Gestion de l'inventaire

### 5.1 Consultation du stock

L'inventaire FleetCrew est accessible depuis **Dashboard > FleetCrew**. Vous pouvez consulter les articles disponibles, leur quantité en stock et leur emplacement.

### 5.2 Sortie de stock

Lorsque vous prélevez des pièces pour une intervention :

1. Accédez à l'inventaire FleetCrew
2. Recherchez l'article concerné
3. Appuyez sur **Sortie de stock**
4. Indiquez la quantité prélevée
5. Sélectionnez le bon de travail associé (optionnel)
6. Validez la transaction

### 5.3 Signalement de stock bas

Si vous constatez qu'un article est en quantité insuffisante, signalez-le au gestionnaire via l'application. Les articles dont le stock est inférieur au seuil minimum génèrent automatiquement une alerte.

---

## 6. Conseils pratiques

### 6.1 Avant chaque inspection

Avant de commencer une inspection, assurez-vous de disposer de :

| Élément | Vérification |
|---------|--------------|
| Appareil chargé | Batterie > 50% |
| Connexion réseau | WiFi ou données mobiles |
| Équipement | Lampe, miroir, jauge de profondeur |
| Accès au véhicule | Clés, autorisation |

### 6.2 Qualité des photos

Pour des photos de qualité optimale :

- Assurez un éclairage suffisant (utilisez la lampe torche si nécessaire)
- Cadrez le défaut au centre de l'image
- Prenez plusieurs angles si le défaut est complexe
- Évitez les reflets et les contre-jours

### 6.3 Codes VMRS courants

| Code | Description |
|------|-------------|
| 013 | Système de freinage |
| 014 | Système de direction |
| 015 | Suspension |
| 017 | Roues et pneus |
| 033 | Éclairage |
| 042 | Système électrique |
| 045 | Moteur |

### 6.4 En cas de problème

Si vous rencontrez un problème technique avec l'application :

1. Vérifiez votre connexion réseau
2. Fermez et rouvrez l'application
3. Vérifiez les mises à jour disponibles
4. Contactez votre gestionnaire ou l'administrateur

Les données sont sauvegardées localement, vous ne perdrez pas votre travail en cours.

---

## 7. Glossaire

| Terme | Définition |
|-------|------------|
| **PNBV** | Poids nominal brut du véhicule |
| **NIV/VIN** | Numéro d'identification du véhicule |
| **VMRS** | Vehicle Maintenance Reporting Standards |
| **PEP** | Programme d'entretien préventif |
| **SAAQ** | Société de l'assurance automobile du Québec |
| **Défaut mineur** | Défaut n'affectant pas la sécurité immédiate |
| **Défaut majeur** | Défaut compromettant la sécurité du véhicule |

---

**Document rédigé par Manus AI pour FleetCore v18.0**
