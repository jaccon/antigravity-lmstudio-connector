# Antigravity LM Studio Connect

**Antigravity LM Studio Connect** (développé par Jaccon) est une extension puissante pour Visual Studio Code conçue pour intégrer parfaitement votre flux de développement local d'IA avec **LM Studio**. L'extension offre des fonctionnalités avancées de chat, d'édition automatique de code basée sur le contexte et d'autocomplétion de code en temps réel (inline completion).

Tout cela fonctionne localement en utilisant des modèles de langage ouverts, garantissant une confidentialité totale de votre code source et l'absence de coûts liés aux API.

## Fonctionnalités Principales

- **Chat avec l'IA dans la barre latérale de VSCode :** Un onglet dédié ("LM Studio Connector") dans votre barre d'activité pour discuter avec l'IA.
- **Contextualisation avec le Fichier Actif :** L'extension partage intelligemment le contenu du fichier que vous êtes en train d'éditer, permettant à l'IA de comprendre le contexte sans que vous n'ayez besoin de copier-coller.
- **Insertion et Édition Directes (Code Actions) :** L'interface de chat propose des boutons pour `Insert` (Insérer), `Replace` (Remplacer) ou créer un `New File` (Nouveau Fichier) directement avec le code suggéré par l'IA, accélérant ainsi votre développement.
- **Modification Automatique (Auto-apply) :** L'IA comprend des commandes spéciales (balises comme `<create_file>` ou `<edit_file>`) et peut créer de nouveaux fichiers ou même appliquer des modifications à l'ensemble du document automatiquement selon votre demande.
- **Autocomplétion en Temps Réel (Inline Completion) :** Au fur et à mesure que vous tapez, l'extension communique avec LM Studio pour prédire et suggérer des suites de code basées sur le contexte environnant.

## Prérequis

1. **Visual Studio Code** (version 1.80.0 ou supérieure).
2. [LM Studio](https://lmstudio.ai) installé et en cours d'exécution sur votre machine locale.
3. Serveur Local (Local Server) en cours d'exécution dans LM Studio :
   - Port par défaut : `1234`
   - Doit supporter les routes compatibles OpenAI : `/v1/chat/completions` (pour le Chat) et `/v1/completions` (pour l'autocomplétion).

## Installation (Hors ligne avec VSIX)

### Comment générer le fichier VSIX (Optionnel)
Si vous ne trouvez pas le fichier `.vsix` dans le dossier (par exemple, après avoir téléchargé le code source depuis GitHub), vous pouvez le compiler manuellement. Ouvrez le terminal à la racine du projet et exécutez :
```bash
npm install -g @vscode/vsce
npm install
vsce package
```
Cela générera le fichier d'extension `.vsix` (ex : `lmstudio-connector-0.0.1.vsix`).

### Étapes d'installation dans VS Code

1. **Accéder à l'onglet Extensions :** Ouvrez Visual Studio Code. Dans la barre latérale gauche, cliquez sur l'icône *Extensions* (`Ctrl+Shift+X` ou `Cmd+Shift+X`).
2. **Sélectionner "Install from VSIX..." :** Dans le panneau des Extensions, cliquez sur l'icône des trois points `...` (Views and More Actions) en haut à droite du menu latéral et sélectionnez l'option **Install from VSIX...**.
   
   <img src="step1.png" width="400" alt="Menu Install from VSIX dans VS Code">

3. **Naviguer vers le fichier :** Une fenêtre s'ouvrira. Naviguez jusqu'au répertoire où se trouve le fichier `.vsix` et sélectionnez-le.
4. **Installation Terminée :** Une notification apparaîtra dans le coin inférieur droit vous informant que l'extension a été installée avec succès.
   
   <img src="step2.png" width="400" alt="Notification de succès de l'installation">

## Comment Exécuter et se Connecter à LM Studio (via API)

Pour que l'extension fonctionne parfaitement, LM Studio doit exécuter un serveur local qui simule l'API d'OpenAI. Suivez ces étapes :

### 1. Préparation de LM Studio
1. Ouvrez l'application **LM Studio** sur votre machine.
2. Accédez à l'onglet **↔️ Local Server** (icône de serveur dans le menu latéral gauche).
3. En haut, sélectionnez le modèle d'IA que vous souhaitez charger en mémoire.
4. Dans le panneau de droite, assurez-vous que l'option **Cross-Origin-Resource-Sharing (CORS)** est activée.
5. Cliquez sur le bouton bleu **Start Server**.
6. Le terminal interne de LM Studio indiquera que l'API est active, généralement sur le port `1234` (ex : `http://localhost:1234/v1`).

### 2. Configuration de l'Extension dans VS Code / Antigravity
Avec le serveur en cours d'exécution, ouvrez votre VS Code :
1. Appuyez sur `Cmd+,` (macOS) ou `Ctrl+,` (Windows/Linux) pour ouvrir les **Paramètres (Settings)**.
2. Dans la barre de recherche, tapez `antigravity.lmStudio`.
3. Remplissez les configurations comme ci-dessous :
   - **Base URL :** Confirmez que l'URL est `http://localhost:1234/v1` (si vous n'avez pas changé le port).
   - **Chat Model :** Saisissez l'alias ou le nom du modèle chargé (LM Studio résout automatiquement les modèles récents comme `local-model` ou `default`).
   - **Autocomplete Enabled :** Cochez (`true`) pour activer et recevoir des suggestions de code directement dans l'éditeur de texte.

### 3. Test de Connexion
Pour être absolument certain que VS Code et LM Studio communiquent :
* Appuyez sur `Cmd+Shift+P` (ou `Ctrl+Shift+P`), recherchez la commande `Antigravity: Test Connection` et appuyez sur *Entrée*.
* Une notification de succès apparaîtra dans le coin de votre écran si l'API répond avec succès. Votre onglet latéral **LM Studio Connector** sera également opérationnel !

## Commandes Disponibles

En ouvrant la palette de commandes de VS Code, les commandes suivantes sont disponibles :
- `Antigravity: Hello World` - Commande de test de base de l'extension.
- `Antigravity: Start Code Chat` - Ouvre et met le focus sur la fenêtre webview du chat dans la barre latérale.
- `Antigravity: Test Connection` - Effectue une vérification de l'état (healthcheck) sur l'API en cours d'exécution de LM Studio.

## Confidentialité et Sécurité

Vos données ne quittent pas votre machine ! Contrairement aux assistants cloud conventionnels, Antigravity LM Studio interagit exclusivement avec le réseau local (`localhost`), traitant tout le code source et les conversations de manière strictement locale, offrant le plus haut degré de sécurité pour le développement de propriété intellectuelle ou pour travailler selon des règles strictes de non-divulgation de données d'entreprise (NDA).

## Contribution et Retour d'information

N'hésitez pas à signaler des problèmes (issues) ou à envoyer des PR (Pull Requests) avec des améliorations pour l'intégration de l'extension.
Développé avec ☕️ et de l'IA par Jaccon.
