import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { AntigravityChatWebviewProvider } from './chatWebview';
import { AntigravityCompletionProvider } from './completionProvider';

async function checkHealth() {
  const config = vscode.workspace.getConfiguration('antigravity.lmStudio');
  const url = config.get<string>('url', 'http://localhost:1234/v1');

  try {
    // Chamamos o endpoint de models para testar se há resposta válida do LM Studio
    const response = await fetch(`${url}/models`);
    if (response.ok) {
      vscode.window.showInformationMessage('✅ Conectado ao LM Studio com sucesso!');
    } else {
      vscode.window.showWarningMessage(`⚠️ O LM Studio respondeu, mas com erro: ${response.status}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage('❌ Falha ao conectar no LM Studio. Verifique se ele está rodando na URL configurada e o servidor local ativo.');
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "antigravity-lm-studio" is now active!');

  // Healthcheck na iniciação
  checkHealth();

  // Comando para testar manualmente a conexão
  context.subscriptions.push(
    vscode.commands.registerCommand('antigravity.testConnection', () => {
      vscode.window.showInformationMessage('Testando conexão com LM Studio...');
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
