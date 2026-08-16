import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="docs-layout">
      <div class="glass-panel docs-card">
        <div class="panel-header">
          <h2>External Web & API Integration</h2>
          <p>
            Connect your WordPress, Laravel, Next.js, Node.js, Python, or PHP
            apps to COMPACTING.
          </p>
        </div>

        <div class="code-tab-selector">
          <button
            class="code-tab"
            [class.active-code-tab]="selectedCodeLanguage() === 'curl'"
            (click)="selectedCodeLanguage.set('curl')"
          >
            cURL
          </button>
          <button
            class="code-tab"
            [class.active-code-tab]="selectedCodeLanguage() === 'js'"
            (click)="selectedCodeLanguage.set('js')"
          >
            JavaScript / Fetch
          </button>
          <button
            class="code-tab"
            [class.active-code-tab]="selectedCodeLanguage() === 'php'"
            (click)="selectedCodeLanguage.set('php')"
          >
            PHP
          </button>
          <button
            class="code-tab"
            [class.active-code-tab]="selectedCodeLanguage() === 'python'"
            (click)="selectedCodeLanguage.set('python')"
          >
            Python
          </button>
          <button
            class="code-tab"
            [class.active-code-tab]="selectedCodeLanguage() === 'csharp'"
            (click)="selectedCodeLanguage.set('csharp')"
          >
            C# (.NET)
          </button>
        </div>

        <div class="code-box">
          <pre
            *ngIf="selectedCodeLanguage() === 'curl'"
          ><code [textContent]="curlSnippet"></code></pre>
          <pre
            *ngIf="selectedCodeLanguage() === 'js'"
          ><code [textContent]="jsSnippet"></code></pre>
          <pre
            *ngIf="selectedCodeLanguage() === 'php'"
          ><code [textContent]="phpSnippet"></code></pre>
          <pre
            *ngIf="selectedCodeLanguage() === 'python'"
          ><code [textContent]="pythonSnippet"></code></pre>
          <pre
            *ngIf="selectedCodeLanguage() === 'csharp'"
          ><code [textContent]="csharpSnippet"></code></pre>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .docs-layout {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .docs-card {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .code-tab-selector {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid var(--border-subtle);
        padding-bottom: 12px;
      }
      .code-tab {
        background: transparent;
        border: 1px solid var(--border-subtle);
        color: var(--text-muted);
        padding: 8px 16px;
        border-radius: var(--radius-sm);
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .code-tab.active-code-tab {
        background: #10b981;
        color: white;
        border-color: #10b981;
      }
      .code-box {
        background: #050810;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 20px;
        overflow-x: auto;
      }
      .code-box pre {
        margin: 0;
        color: #e2e8f0;
        font-size: 0.9rem;
        line-height: 1.6;
      }
    `
  ]
})
export class DocsComponent {
  selectedCodeLanguage = signal<'curl' | 'js' | 'php' | 'python' | 'csharp'>(
    'curl'
  );

  curlSnippet = `curl -X POST "http://localhost:5126/api/v1/compression/compress?quality=80&format=WebP" \\
  -H "X-API-Key: YOUR_API_KEY_HERE" \\
  -F "file=@banner.png" \\
  --output compressed_banner.webp`;

  jsSnippet = `const formData = new FormData();
formData.append('file', fileBlob, 'photo.jpg');

const response = await fetch('http://localhost:5126/api/v1/compression/compress-json?quality=80&format=WebP', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY_HERE'
  },
  body: formData
});

const data = await response.json();
console.log(\`Saved \${data.compressionRatioPercent}%\`, data.base64Data);`;

  phpSnippet = `$ch = curl_init('http://localhost:5126/api/v1/compression/compress?quality=80&format=WebP');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-API-Key: YOUR_API_KEY_HERE']);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'file' => new CURLFile('/path/to/image.png')
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$compressedBinary = curl_exec($ch);
file_put_contents('/path/to/compressed.webp', $compressedBinary);
curl_close($ch);`;

  pythonSnippet = `import requests

url = "http://localhost:5126/api/v1/compression/compress?quality=80&format=WebP"
headers = {"X-API-Key": "YOUR_API_KEY_HERE"}

with open("sample.png", "rb") as f:
    files = {"file": f}
    response = requests.post(url, headers=headers, files=files)
    
with open("sample.webp", "wb") as f_out:
    f_out.write(response.content)`;

  csharpSnippet = `using var client = new HttpClient();
client.DefaultRequestHeaders.Add("X-API-Key", "YOUR_API_KEY_HERE");

using var content = new MultipartFormDataContent();
using var fileStream = File.OpenRead("photo.png");
content.Add(new StreamContent(fileStream), "file", "photo.png");

var response = await client.PostAsync("http://localhost:5126/api/v1/compression/compress?quality=80&format=WebP", content);
var compressedBytes = await response.Content.ReadAsByteArrayAsync();
await File.WriteAllBytesAsync("photo.webp", compressedBytes);`;
}
