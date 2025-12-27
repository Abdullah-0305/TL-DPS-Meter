# ⚔️ TL DPS Meter - Throne and Liberty

[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](https://github.com/Abdullah-0305/TL-DPS-Meter/releases)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Un analyseur de combat léger, performant et non-intrusif pour **Throne and Liberty**. Suivez votre DPS, vos taux de critiques et vos attaques puissantes (Heavy Attacks) en temps réel.

---

## 🚀 Installation & Utilisation

1. **Téléchargement** : Allez dans la section [Releases](https://github.com/Abdullah-0305/TL-DPS-Meter/releases) et téléchargez le fichier `TL-DPS-Meter_Setup_X.X.X.exe`.
2. **Installation** : 
   * Lancez l'exécutable. L'assistant installera l'application et créera un raccourci sur votre **Bureau**.
   * *Note : Une autorisation Administrateur sera demandée pour permettre la lecture des logs.*
3. **Configuration en jeu** :
   * Lancez **Throne and Liberty**.
   * Activez l'option **"Enregistrer l'historique de combat"**.
4. **Lancement** : Double-cliquez simplement sur l'icône **TL DPS Meter** sur votre bureau.

---

## 🔄 Mises à jour automatiques

L'application intègre un système de mise à jour intelligente :
* **Détection** : À chaque lancement, l'outil vérifie si une nouvelle version existe sur GitHub.
* **Transparence** : Le téléchargement se fait en arrière-plan (un indicateur s'affiche en haut de l'application).
* **Simplicité** : Une fois prête, la mise à jour s'appliquera automatiquement au prochain redémarrage.

---

## ⚙️ Comment ça marche ?

L'outil fonctionne de manière sécurisée sans jamais interférer avec les processus du jeu :

* **Lecture de fichiers logs** : L'application lit les fichiers texte (`.log`) générés par le jeu dans votre dossier `%LOCALAPPDATA%\TL\Saved\CombatLogs`. 
* **Précision en temps réel** : Les données sont analysées ligne par ligne dès qu'elles sont écrites par le serveur du jeu sur votre disque.
* **Détails des compétences** : Cliquez sur n'importe quelle ligne du tableau pour ouvrir une fenêtre détaillée (Min/Max/Moyenne) par type de coup (Normal, Critique, Heavy).

---

## 🛡️ Sécurité & Windows

* **SmartScreen** : Comme l'exécutable n'est pas signé numériquement (certificat payant), Windows affichera une alerte bleue au premier lancement. Cliquez sur **"Informations complémentaires"** puis **"Exécuter quand même"**.
* **Privilèges** : L'application demande les droits administrateur pour lever les restrictions de Windows sur la lecture des fichiers système du jeu.

---

## 🛠️ Développement

Projet réalisé avec :
* **React 19** + **Vite** (Frontend)
* **Electron** (Framework desktop)
* **Chokidar** (Surveillance des fichiers en temps réel)

---

## 📝 Licence

Ce projet est sous licence MIT. Libre à vous de le modifier et de le partager.

---
*Développé par [Abdullah-0305](https://github.com/Abdullah-0305)*