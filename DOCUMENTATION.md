# Documentation Technique : Comment fonctionne Antigravity LM Studio Connect

Bienvenue dans l'espace développeur. Ce document vise à expliquer étape par étape toute l'architecture et le fonctionnement de l'extension **Antigravity LM Studio Connect** développée par **Jaccon**. L'objectif est de faciliter la publication sur le [VSCode Extensions Marketplace](https://marketplace.visualstudio.com/) et la compatibilité du modèle de système pour le système d'exploitation interne d'**Antigravity**.

L'extension a été conçue de manière modulaire en TypeScript et interagit avec les API de Visual Studio Code. Voici les secrets de l'extension.

## Structure Principale des Fichiers : `src`

L'intégralité du cœur de l'application réside dans trois fichiers dans le dossier `src/` :

1. `extension.ts` (Point d'entrée et Événements Globaux)
2. `chatWebview.ts` (Interface de Chat et Logique de Remplacement de Code)
3. `completionProvider.ts` (Moteur d'Autocomplétion)

---

### 1. `extension.ts` : Le Point d'Activation

Le fichier `extension.ts` agit comme le **chef d'orchestre**, responsable de la gestion de toute l'infrastructure de base lorsque l'extension s'initialise (activée par l'événement `onStartupFinished`).

**Principales tâches effectuées dans ce fichier :**
- **Healthcheck Automatisé :** Au moment du chargement initial, une vérification est faite à l'URL locale définie pour tester les routes via `/models`. Si le nœud détecte le serveur (LM Studio, dans ce cas, le `status 200`), il affiche une popup verte indiquant "Connecté à LM Studio avec succès !".
- **Enregistrement du Provider UI (WebviewView) :** Injecte dans le composant Sidebar (Barre d'Activité, ID : `antigravityPanel`) l'écran HTML personnalisé développé dans `chatWebview.ts`.
- **Enregistrement du Provider Inline Completion :** Si la clé `antigravity.lmStudio.autocompleteEnabled` est activée dans les paramètres (Settings), il relie le module `completionProvider.ts` à l'API native de VS Code (`vscode.languages.registerInlineCompletionItemProvider`), permettant une écoute totale sur toutes les lignes de code modifiées.
- **Enregistrement des Commandes d'Action :** Enregistre dans la palette de commandes des raccourcis tels que `antigravity.startChat` et `antigravity.testConnection`.

---

### 2. `chatWebview.ts` : La Frontière Interactive

Votre communication avec LM Studio pendant le chat passe obligatoirement par `chatWebview.ts`. Ce fichier étend `vscode.WebviewViewProvider` et renvoie un HTML/CSS minimaliste injecté dans l'environnement de l'explorateur VSCode, contenant la logique des postMessages (aller-retour) de l'application.

**Architecture de `handleChatMessage` :**
- **Extraction du Contexte Dynamique :** Avant d'être envoyé à LMStudio, le message localise quel onglet de texte le développeur a mis en focus (`activeEditor`).
- **Limitation de Mémoire Sécurisée (Clamp) :** Il capture tout le code qui est actif dans la fenêtre (limité à 20 000 caractères pour éviter les "Out of Memory" et les dépassements de contexte) en le concaténant dans un `System Prompt`.
- **Comportements Autonomes Spécifiques (<tags>) :** L'IA a pour instruction de se comporter de manière à injecter en utilisant des balises XML. Si l'IA répond avec des blocs délimités, `chatWebview` les lira (via des Expressions Régulières).
  - S'il détecte une encapsulation dans `<create_file>`, il déclenchera le Workspace de VS Code pour créer un nouvel onglet à partir de zéro contenant le code suggéré.
  - S'il détecte un `<edit_file>`, le code de l'onglet local subira un bypass, avec écrasement ou remplacement en temps réel.
- **Requête REST via Node-Fetch :** Le déclenchement des conversations est sérialisé via JSON de bout en bout, frappant l'URI de chat de votre serveur (`/chat/completions`). C'est ainsi que se produit l'animation "Antigravity is thinking...".

**Le front-end intégré (UI du Code Chat) :**
L'API de VS Code fournit une méthode sécurisée de rendu Markdown. Tous les blocs de code (` ``` `) affichés sont dotés de boutons intégrés avec rappel atomique (callback) grâce à des personnalisations HTML :
- Bouton "Insert" (Insérer) – Écrit le snippet (extrait de code) sur la ligne actuelle du curseur dans le fichier actif.
- Bouton "Replace" (Remplacer) – Efface tout le code de ce fichier et le remplace par le snippet présenté.
- Bouton "New File" (Nouveau Fichier) – Ouvre dynamiquement l'onglet temporaire en générant les binaires dans le cache sans sauvegarder.

---

### 3. `completionProvider.ts` : Intelligence et "Ghost Text" en Temps Réel

L'Autocomplete (Autocomplétion) respecte le contrat de l'API originale de Visual Studio Code pour la complétion (`vscode.InlineCompletionItemProvider`). Contrairement à un plugin comme Copilot, il interagit exclusivement avec l'interface locale.

**Protection Logique Interne :**
- **Debouncing :** Implémentation d'un délai (via `setTimeout`) de 500 ms ; nous n'envoyons donc une requête au réseau que lorsque le développeur a terminé une certaine quantité de frappe. Sinon, les serveurs locaux planteraient.
- **Découpage de Texte Précédent/Suivant (Préfixe et Suffixe) :** Nous identifions précisément où se trouve le curseur ("position"). Nous coupons littéralement les lignes au-dessus, simulant la technique rudimentaire de "Fill-in-the-Middle" ou d'Autocomplétion Séquentielle.
- **Le Payload de Prédiction :** Ce point de terminaison pointe vers la route générique du LLM (`/completions` au lieu de `/chat/completions`), nécessitant une complétion de base passive, avec un arrêt de token via `['\n\n', '<|endoftext|>']`.

---

## Le Flux Global - Du Setup au Runtime

1. **Activation (ActivationEvent = onStartupFinished) :** La fenêtre effectue le rendu.
2. **Configuration des Paramètres (Settings) :** Initialisation définissant des variables globales enregistrées dans vos paramètres VS Code pour cibler IP:Port.
3. **Écoute des Modifications (Listener) :** La barre latérale de Code Chat s'instancie en arrière-plan (background thread) tandis que le Provider d'autocomplétion s'active avec le curseur.
4. **Requêtes Fetch & Promesses (Promises) :** Envoi transitoire des événements sur le port 1234 et analyse (parse) du résultat.

L'extension est encapsulée pour qu'elle puisse à l'avenir être versionnée et indexée pour être compatible non seulement avec LM Studio, mais aussi avec OLLAMA et d'autres technologies de pont API local, grâce à l'adoption native du schéma compatible avec le payload d'OpenAI.
