import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { AntigravityChatWebviewProvider } from './chatWebview';
import { AntigravityCompletionProvider } from './completionProvider';

async function checkHealth() {
  const config = vscode.workspace.getConfiguration('antigravity.lmStudio');
  const url = config.get<string>('url', 'http://localhost:1234/v1');

  try {
    // Nous appelons le point de terminaison de models pour tester s'il y a une réponse valide de LM Studio
    const response = await fetch(`${url}/models`);
    if (response.ok) {
      vscode.window.showInformationMessage('✅ Connecté à LM Studio avec succès !');
    } else {
      vscode.window.showWarningMessage(`⚠️ LM Studio a répondu, mais avec une erreur : ${response.status}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage('❌ Échec de la connexion à LM Studio. Vérifiez s\'il est en cours d\'exécution sur l\'URL configurée et que le serveur local est actif.');
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "antigravity-lm-studio" is now active!');

  // Bilan de santé au démarrage
  checkHealth();

  // Commande pour tester manuellement la connexion
  context.subscriptions.push(
    vscode.commands.registerCommand('antigravity.testConnection', () => {
      vscode.window.showInformationMessage('Test de la connexion avec LM Studio...');
      checkHealth();
    })
  );

  // Setup Hello World Command
  context.subscriptions.push(
    vscode.commands.registerCommand('antigravity.helloWorld', () => {
      vscode.window.showInformationMessage('Hello World from Antigravity LM Studio!');
    })
  );

  // Setup Webview Chat Provider
  const chatProvider = new AntigravityChatWebviewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AntigravityChatWebviewProvider.viewType,
      chatProvider
    )
  );

  // Register command to force open chat
  context.subscriptions.push(
    vscode.commands.registerCommand('antigravity.startChat', () => {
      vscode.commands.executeCommand('antigravity.chatView.focus');
    })
  );

  // Setup Inline Completion Provider
  const autocompleteEnabled = vscode.workspace.getConfiguration('antigravity.lmStudio').get('autocompleteEnabled', true);
  if (autocompleteEnabled) {
    const provider = new AntigravityCompletionProvider();
    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        { pattern: '**' },
        provider
      )
    );
  }
}

export function deactivate() { }
