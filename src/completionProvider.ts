import * as vscode from 'vscode';
import fetch from 'node-fetch';

export class AntigravityCompletionProvider implements vscode.InlineCompletionItemProvider {
  private _debounceTimer: NodeJS.Timeout | undefined;

  public async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | undefined> {
    
    // Only fetch if explicitly requested or auto-triggered, but debounce 
    // to avoid overloading LM Studio
    return new Promise((resolve) => {
      if (this._debounceTimer) {
        clearTimeout(this._debounceTimer);
      }

      this._debounceTimer = setTimeout(async () => {
        if (token.isCancellationRequested) {
          return resolve(undefined);
        }

        const lines = document.getText().split('\n');
        const prefixLines = lines.slice(0, position.line);
        const currentLinePrefix = lines[position.line].substring(0, position.character);
        const prefix = prefixLines.join('\n') + (prefixLines.length > 0 ? '\n' : '') + currentLinePrefix;
        
        const suffixLines = lines.slice(position.line + 1);
        const currentLineSuffix = lines[position.line].substring(position.character);
        const suffix = currentLineSuffix + (suffixLines.length > 0 ? '\n' : '') + suffixLines.join('\n');

        const config = vscode.workspace.getConfiguration('antigravity.lmStudio');
        const url = config.get<string>('url', 'http://localhost:1234/v1');
        const model = config.get<string>('chatModel', 'local-model');

        try {
          // This uses standard /completions. For models with FIM support, 
          // prompt formats may vary (e.g., StarCoder <fim_prefix>...<fim_suffix>...<fim_middle>).
          // We provide a basic single-shot generation prompt assuming standard completion endpoint.
          const response = await fetch(`${url}/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: model,
              prompt: prefix, // We rely on standard text completion for prefix. 
              max_tokens: 50,
              temperature: 0.1,
              stop: ['\n\n', '<|endoftext|>']
            })
          });

          if (!response.ok) {
            return resolve(undefined);
          }

          const data = await response.json() as any;
          if (data.choices && data.choices[0] && data.choices[0].text) {
            let insertText = data.choices[0].text;
            
            // Generate inline completion
            const item = new vscode.InlineCompletionItem(
              insertText,
              new vscode.Range(position, position)
            );
            resolve([item]);
          } else {
            resolve(undefined);
          }
        } catch (error) {
          // Silent error for inline completions to avoid spamming the user
          console.error(error);
          resolve(undefined);
        }
      }, 500); // 500ms debounce
    });
  }
}
