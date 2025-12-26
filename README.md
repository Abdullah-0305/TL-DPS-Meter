# ⚔️ TL DPS Meter - Throne and Liberty

Un analyseur de combat léger, performant et non-intrusif pour **Throne and Liberty**. Suivez votre DPS, vos taux de critiques et vos attaques puissantes en temps réel.

---

## 🚀 Installation & Utilisation

1. **Téléchargement** : Allez dans la section [Releases](https://github.com/Abdullah-0305/TL-DPS-Meter/releases) et téléchargez le dernier fichier `.zip`.
2. **Extraction** : Extrayez le contenu du ZIP dans le dossier de votre choix.
3. **Configuration en jeu** :
   * Lancez **Throne and Liberty**.
   * Activez l'option **"Enregistrer l'historique de combat"**.
4. **Lancement** : Faites un clic-droit sur `TL DPS Meter.exe` et choisissez **"Exécuter en tant qu'administrateur"**.

---

## ⚙️ Comment ça marche ?

L'outil fonctionne de manière sécurisée sans jamais interférer avec les processus du jeu :

* **Lecture de fichiers logs** : L'application lit les fichiers texte (`.log`) générés par le jeu dans votre dossier `%LOCALAPPDATA%\TL\Saved\CombatLogs`. 
* **Sécurité Anti-Ban** : Comme l'outil ne s'injecte pas dans la mémoire du jeu (RAM) et ne modifie aucun fichier, il respecte les conditions d'utilisation et ne présente aucun risque de bannissement.
* **Précision en temps réel** : Les données sont analysées ligne par ligne dès qu'elles sont écrites par le serveur du jeu.
* **Détails des compétences** : Cliquez sur n'importe quelle ligne du tableau pour ouvrir une modale détaillée affichant les statistiques (Min/Max/Moyenne) par type de coup (Normal, Critique, Heavy).

---

## 🛡️ Notes de sécurité & Windows

* **SmartScreen** : Comme l'exécutable n'est pas signé numériquement, Windows affichera une alerte au premier lancement. Cliquez sur **"Informations complémentaires"** puis **"Exécuter quand même"**.
* **Mode Administrateur** : Ce mode est nécessaire pour permettre à l'application de lire les fichiers créés par le jeu sans blocage du système.

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
*Créé par Abdullah-0305*