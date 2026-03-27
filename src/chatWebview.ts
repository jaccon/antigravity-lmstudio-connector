import * as vscode from 'vscode';
import fetch from 'node-fetch';

export class AntigravityChatWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'antigravity.chatView';
  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) { }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'sendMessage':
          await this.handleChatMessage(data.messages);
          break;
        case 'applyCode':
          await this.handleApplyCode(data);
          break;
      }
    });
  }

  private async handleApplyCode(data: { action: string, code: string }) {
    const activeEditor = vscode.window.activeTextEditor;

    if (data.action === 'newFile') {
      const doc = await vscode.workspace.openTextDocument({ content: data.code });
      await vscode.window.showTextDocument(doc);
    } else if (data.action === 'insert' && activeEditor) {
      activeEditor.edit(editBuilder => {
        editBuilder.insert(activeEditor.selection.active, data.code);
      });
    } else if (data.action === 'replace' && activeEditor) {
      const document = activeEditor.document;
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
      );
      activeEditor.edit(editBuilder => {
        editBuilder.replace(fullRange, data.code);
      });
    } else if (data.action !== 'newFile' && !activeEditor) {
      vscode.window.showErrorMessage('No active file to apply code.');
    }
  }

  private async handleChatMessage(messages: any[]) {
    const config = vscode.workspace.getConfiguration('antigravity.lmStudio');
    const url = config.get<string>('url', 'http://localhost:1234/v1');
    const model = config.get<string>('chatModel', 'local-model');

    let systemPrompt = "You are Antigravity, a helpful coding assistant. IMPORTANT: When you write code to create a NEW file or feature, you MUST enclose the code block inside <create_file>...</create_file> tags. When you write code to MODIFY or EDIT the currently open file, you MUST enclose the code block inside <edit_file>...</edit_file> tags.";
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const document = activeEditor.document;
      const text = document.getText();
      const fileName = document.fileName;
      const clampedText = text.length > 20000 ? text.substring(0, 20000) + '... (truncated)' : text;

      systemPrompt += ` The user currently has the file '${fileName}' open with the following content:\n\n\`\`\`\n${clampedText}\n\`\`\``;
    }

    if (messages.length > 0 && messages[0].role === 'system') {
      messages[0].content = systemPrompt;
    } else {
      messages.unshift({ role: 'system', content: systemPrompt });
    }

    this._view?.webview.postMessage({ type: 'startLoading' });

    try {
      const response = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error(`LM Studio HTTP error: ${response.status}`);
      }

      const data = await response.json() as any;
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const messageContent = data.choices[0].message.content;
        
        this._view?.webview.postMessage({
          type: 'receiveMessage',
          message: data.choices[0].message
        });

        // Auto apply changes
        const createMatch = messageContent.match(/<create_file>([\s\S]*?)<\/create_file>/);
        const editMatch = messageContent.match(/<edit_file>([\s\S]*?)<\/edit_file>/);

        if (createMatch) {
          let code = createMatch[1].trim();
          code = code.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
          const doc = await vscode.workspace.openTextDocument({ content: code });
          await vscode.window.showTextDocument(doc);
        } else if (editMatch) {
          let code = editMatch[1].trim();
          code = code.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            const document = editor.document;
            const fullRange = new vscode.Range(
              document.positionAt(0),
              document.positionAt(document.getText().length)
            );
            await editor.edit(editBuilder => {
              editBuilder.replace(fullRange, code);
            });
          }
        }
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(`Antigravity LM Studio error: ${err.message}`);
      this._view?.webview.postMessage({
        type: 'receiveError',
        error: "Failed to connect to LM Studio. Make sure it's running."
      });
    } finally {
      this._view?.webview.postMessage({ type: 'stopLoading' });
    }
  }

  private _getHtmlForWebview() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Antigravity Chat</title>
    <style>
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      body {
        font-family: var(--vscode-font-family);
        display: flex;
        flex-direction: column;
        background-color: #000;
        color: #ccc;
      }
      .chat-box {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .message {
        padding: 10px;
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.4;
        word-wrap: break-word;
      }
      .user-msg {
        background-color: var(--vscode-textBlockQuote-background);
        border: 1px solid var(--vscode-textBlockQuote-border);
        align-self: flex-end;
        max-width: 85%;
        color: #ccc;
      }
      .assistant-msg {
        background-color: var(--vscode-editor-inactiveSelectionBackground);
        border: 1px solid var(--vscode-widget-border, transparent);
        align-self: stretch;
        max-width: 100%;
        color: #ccc;
      }
      .input-box {
        padding: 10px;
        border-top: 1px solid var(--vscode-panel-border);
        display: flex;
        gap: 8px;
        background-color: transparent;
      }
      textarea {
        flex: 1;
        resize: none;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid var(--vscode-input-border);
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        font-family: inherit;
        height: 60px;
      }
      textarea:focus {
        outline: 1px solid var(--vscode-focusBorder);
      }
      button {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background-color: var(--vscode-button-hoverBackground);
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .loading {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        padding: 0 10px;
        margin-top: -5px;
        margin-bottom: 5px;
      }
    </style>
</head>
<body>
    <div class="chat-box" id="chat"></div>
    <div id="loading" class="loading" style="display: none;">Antigravity is thinking...</div>
    <div class="input-box">
      <textarea id="prompt" placeholder="Ask Antigravity..."></textarea>
      <button id="sendBtn">Send</button>
    </div>

    <script>
      const vscode = acquireVsCodeApi();
      let messages = [];

      const chatElement = document.getElementById('chat');
      const promptElement = document.getElementById('prompt');
      const sendBtn = document.getElementById('sendBtn');
      const loadingEl = document.getElementById('loading');

      function renderMessages() {
        chatElement.innerHTML = '';
        messages.forEach(msg => {
          const div = document.createElement('div');
          div.className = "message " + (msg.role === 'user' ? 'user-msg' : 'assistant-msg');
          
          // Basic markdown handling for code blocks
          const content = msg.content
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\\\`\\\`\\\`([\\s\\S]*?)\\\`\\\`\\\`/g, function(match, code) {
              return '<div style="position:relative; margin-top: 10px; margin-bottom: 10px;">\\n' +
                '  <pre style="background:var(--vscode-editor-inactiveSelectionBackground);padding:24px 8px 8px;border-radius:4px;overflow-x:auto;"><code>' + code + '</code></pre>\\n' +
                '  <div style="position:absolute;top:4px;right:4px;display:flex;gap:4px;">\\n' +
                '    <button style="font-size:10px;padding:2px 4px;background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground);" onclick="applyCode(this, \\\'insert\\\')">Insert</button>\\n' +
                '    <button style="font-size:10px;padding:2px 4px;background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground);" onclick="applyCode(this, \\\'replace\\\')">Replace</button>\\n' +
                '    <button style="font-size:10px;padding:2px 4px;background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground);" onclick="applyCode(this, \\\'newFile\\\')">New File</button>\\n' +
                '  </div>\\n' +
              '</div>';
            })
            .replace(/\\\`([^\\\`]+)\\\`/g, '<code style="background:var(--vscode-editor-inactiveSelectionBackground);padding:2px 4px;border-radius:3px;">$1</code>');
          
          div.innerHTML = content;
          chatElement.appendChild(div);
        });
        chatElement.scrollTop = chatElement.scrollHeight;
      }

      window.applyCode = function(button, action) {
        const pre = button.parentElement.parentElement.querySelector('pre');
        if (!pre) return;
        let code = pre.textContent || '';
        if (code.match(/^[a-zA-Z0-9_-]+\\n/)) {
            code = code.substring(code.indexOf('\\n') + 1);
        }
        vscode.postMessage({ type: 'applyCode', action: action, code: code });
      }

      function sendMessage() {
        const text = promptElement.value.trim();
        if(!text) return;
        
        messages.push({ role: 'user', content: text });
        renderMessages();
        
        promptElement.value = '';
        vscode.postMessage({ type: 'sendMessage', messages: messages });
      }

      sendBtn.addEventListener('click', sendMessage);
      promptElement.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
          case 'receiveMessage':
            messages.push(message.message);
            renderMessages();
            break;
          case 'receiveError':
            messages.push({ role: 'system', content: \`Error: \${message.error}\` });
            renderMessages();
            break;
          case 'startLoading':
            loadingEl.style.display = 'block';
            sendBtn.disabled = true;
            promptElement.disabled = true;
            break;
          case 'stopLoading':
            loadingEl.style.display = 'none';
            sendBtn.disabled = false;
            promptElement.disabled = false;
            promptElement.focus();
            break;
        }
      });
    </script>
</body>
</html>`;
  }
}
