import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      <div class="rounded-xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-5">
        <div class="space-y-1">
          <h2 class="text-base font-semibold tracking-tight text-slate-900">
            External Web & API Integration
          </h2>
          <p class="text-xs text-slate-500">
            Connect your WordPress, Laravel, Next.js, Node.js, Python, or PHP apps to COMPACTING.
          </p>
        </div>

        <div
          class="inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500"
        >
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all"
            [ngClass]="
              selectedCodeLanguage() === 'curl'
                ? 'bg-white text-slate-950 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            "
            (click)="selectedCodeLanguage.set('curl')"
          >
            cURL
          </button>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all"
            [ngClass]="
              selectedCodeLanguage() === 'js'
                ? 'bg-white text-slate-950 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            "
            (click)="selectedCodeLanguage.set('js')"
          >
            JavaScript / Fetch
          </button>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all"
            [ngClass]="
              selectedCodeLanguage() === 'php'
                ? 'bg-white text-slate-950 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            "
            (click)="selectedCodeLanguage.set('php')"
          >
            PHP
          </button>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all"
            [ngClass]="
              selectedCodeLanguage() === 'python'
                ? 'bg-white text-slate-950 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            "
            (click)="selectedCodeLanguage.set('python')"
          >
            Python
          </button>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all"
            [ngClass]="
              selectedCodeLanguage() === 'csharp'
                ? 'bg-white text-slate-950 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            "
            (click)="selectedCodeLanguage.set('csharp')"
          >
            C# (.NET)
          </button>
        </div>

        <div class="rounded-lg border border-slate-800 bg-slate-950 p-4.5 overflow-x-auto">
          <pre
            *ngIf="selectedCodeLanguage() === 'curl'"
            class="text-xs font-mono text-slate-100 leading-relaxed m-0"
          ><code [textContent]="curlSnippet"></code></pre>
          <pre
            *ngIf="selectedCodeLanguage() === 'js'"
            class="text-xs font-mono text-slate-100 leading-relaxed m-0"
          ><code [textContent]="jsSnippet"></code></pre>
          <pre
            *ngIf="selectedCodeLanguage() === 'php'"
            class="text-xs font-mono text-slate-100 leading-relaxed m-0"
          ><code [textContent]="phpSnippet"></code></pre>
          <pre
            *ngIf="selectedCodeLanguage() === 'python'"
            class="text-xs font-mono text-slate-100 leading-relaxed m-0"
          ><code [textContent]="pythonSnippet"></code></pre>
          <pre
            *ngIf="selectedCodeLanguage() === 'csharp'"
            class="text-xs font-mono text-slate-100 leading-relaxed m-0"
          ><code [textContent]="csharpSnippet"></code></pre>
        </div>
      </div>
    </section>
  `
})
export class DocsComponent {
  selectedCodeLanguage = signal<'curl' | 'js' | 'php' | 'python' | 'csharp'>('curl');

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
