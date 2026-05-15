# Comment Publier votre Extension (VSCode et Antigravity)

Ce document a été élaboré pour vous guider, étape par étape, dans le processus de création de paquet (packaging), de publication et de distribution de l'extension **Antigravity LM Studio Connect** (développée par Jaccon), permettant à d'autres développeurs de la télécharger depuis le Marketplace de Visual Studio Code ou de l'utiliser au sein de l'écosystème Antigravity.

---

## Partie 1 : Publication sur le Marketplace Visual Studio Code

Microsoft fournit un outil officiel en ligne de commande appelé **vsce** (Visual Studio Code Extensions), qui gère la publication des extensions.

### Étape 1 : Prérequis
1. Vous devez avoir l'installateur global de `vsce` sur votre machine. Ouvrez votre terminal et exécutez :
   ```bash
   npm install -g @vscode/vsce
   ```
2. Créez un [Compte Développeur chez Microsoft (Azure DevOps)](https://dev.azure.com/).
3. Obtenez un **Personal Access Token (PAT)** dans Azure DevOps pour valider qui est responsable de la publication. Créez une organisation et accédez à "Security > Personal access tokens".
   - **Portées requises (Scopes) :** `Marketplace (Acquire, Manage, Publish)`.
4. Créez un Éditeur (Publisher) en accédant à la page officielle de [Visual Studio Marketplace Management](https://marketplace.visualstudio.com/manage) et connectez-vous. Créez un nouveau `Publisher` avec le nom de votre choix (par exemple, `jaccon`).

### Étape 2 : Empaquetage (Test du Build)
Avant d'envoyer, il est judicieux de créer et de tester le binaire de l'extension localement en utilisant le format standard du store pour les extensions Microsoft.

1. Dans le terminal, à la racine du projet, lancez vsce :
   ```bash
   vsce package
   ```
2. Si des erreurs apparaissent (par exemple, si un champ obligatoire tel que le champ `publisher` ou l'URL de votre logo/repo dans `package.json` est manquant), corrigez-les. 
   > N'oubliez pas : Votre `package.json` **doit** comporter la balise `"publisher": "votre_nom_editeur"`. 
3. Si la commande ci-dessus s'exécute avec succès, elle créera un fichier nommé : `antigravity-lm-studio-0.0.1.vsix`. 
   Vous pouvez déjà le tester dans VSCode avec `Cmd+Shift+P` -> `Extensions: Install from VSIX...`

### Étape 3 : Publication (Déploiement pour les autres)
Maintenant que votre extension est empaquetée et que vous avez votre token en main :

1. Connectez-vous à la CLI de vsce en renseignant le nom de votre éditeur tel qu'enregistré dans le store :
   ```bash
   vsce login votre-nom-editeur
   ```
   *Il vous demandera le Personal Access Token de Microsoft et liera les accès à votre terminal.*

2. Publiez sur le Marketplace ! Vous pouvez le faire en lançant la simple commande :
   ```bash
   vsce publish
   ```
Voilà ! D'ici quelques minutes, votre extension commencera à être indexée dans l'écran interne des extensions de tous les programmeurs recherchant **"Antigravity LM Studio"**.

---

## Partie 2 : Rendre l'Extension disponible dans l'Écosystème Antigravity

Toute intégration avec Antigravity IDE bénéficie d'une synergie 100% native avec le squelette de Visual Studio Code. Les distributions de la famille VSCode utilisent généralement deux méthodes pour l'importation d'extensions par l'infrastructure Antigravity :

### Option A : Stores Décentralisés (Open VSX) et Mise à Jour Automatique
Par défaut, Antigravity voit les dépôts compatibles avec Open VSX ou les miroirs de Microsoft VSCode.
1. Si votre extension a déjà été publiée sur le store Microsoft (étape ci-dessus), vous pouvez la synchroniser ou utiliser le système CLI central appelé `ovsx` :
   ```bash
   npx ovsx publish package.vsix -p <VOTRE_TOKEN_OPENVSX>
   ```
   De cette façon, les deux univers téléchargeront à partir de dépôts transparents.

### Option B : Fichier Exécutable Indépendant (.VSIX) 
Dans le cas où l'Antigravity de votre équipe fonctionne sur une infrastructure fermée, ou pour des environnements hors ligne (où les IA et API s'exécutent uniquement sur Localhost LM Studio) :

1. Générez le fichier exécutable hors ligne de l'extension décrit à l'étape précédente, en tapant :
   ```bash
   vsce package
   ```
2. Partagez le fichier généré (exemple : `antigravity-lm-studio-X.X.X.vsix`) à la racine du dossier de ce projet via chat/e-mail, ou en le plaçant sur votre page Github Releases.
3. Vos collègues peuvent ouvrir leur Antigravity Desktop et l'installer nativement de la manière suivante :
   - Aller dans le panneau Extensions dans la barre latérale gauche d'Antigravity.
   - Cliquer sur les `...` (trois points) listés en haut à droite du menu.
   - Sélectionner l'option : **"Install from VSIX"**.
   - Sélectionner le fichier que vous leur avez envoyé et attendre que le `Restart Required` (Redémarrage requis) apparaisse.

---

## Résumé des Étapes à suivre
1. Ajoutez la clé `"publisher"` dans votre `package.json` *(Ex : `"publisher": "jaccon"`)*.
2. Ajoutez des liens vers votre dépôt *(Ex : `"repository": {"type": "git", "url": "https://github.com/jaccon/..."}`)* pour éviter les avertissements dans le terminal.
3. Exécutez `npm run lint` et vérifiez que tout le code est propre (Typescript ne signale pas les problèmes lors de l'empaquetage).
4. Suivez les commandes `vsce package` ou `publish` pour générer la version finale pour le monde !
