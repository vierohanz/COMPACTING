import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="space-y-6">
      <div class="rounded-2xl border border-[#242e42] bg-[#0e121a] shadow-xl p-6 sm:p-8 space-y-6">
        <div class="space-y-1 border-b border-[#1b2232] pb-4">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-black tracking-wide text-white">
              External Web & API Integration
            </h2>
            <span
              class="inline-flex items-center rounded-md border border-[#00d2ff]/40 bg-[#00d2ff]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#00d2ff]"
              >SDK SUITE</span
            >
          </div>
          <p class="text-xs text-slate-400">
            Connect your WordPress, Laravel, Next.js, Node.js, Python, or PHP apps to the COMPACTING Spider Engine.
          </p>
        </div>

        <div
          class="inline-flex h-10 items-center justify-center rounded-xl bg-[#080a0f] border border-[#1b2232] p-1 text-slate-400 overflow-x-auto"
        >
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            [ngClass]="
              selectedCodeLanguage() === 'curl'
                ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/20'
                : 'text-slate-400 hover:text-white hover:bg-[#141a26]'
            "
            (click)="selectedCodeLanguage.set('curl')"
          >
            cURL
          </button>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            [ngClass]="
              selectedCodeLanguage() === 'js'
                ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/20'
                : 'text-slate-400 hover:text-white hover:bg-[#141a26]'
            "
            (click)="selectedCodeLanguage.set('js')"
          >
            JavaScript / Fetch
          </button>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            [ngClass]="
              selectedCodeLanguage() === 'php'
                ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/20'
                : 'text-slate-400 hover:text-white hover:bg-[#141a26]'
            "
            (click)="selectedCodeLanguage.set('php')"
          >
            PHP
          </button>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            [ngClass]="
              selectedCodeLanguage() === 'python'
                ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/20'
                : 'text-slate-400 hover:text-white hover:bg-[#141a26]'
            "
            (click)="selectedCodeLanguage.set('python')"
          >
            Python
          </button>
          <button
            class="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            [ngClass]="
              selectedCodeLanguage() === 'csharp'
                ? 'bg-[#ef233c] text-white shadow-md shadow-[#ef233c]/20'
                : 'text-slate-400 hover:text-white hover:bg-[#141a26]'
            "
            (click)="selectedCodeLanguage.set('csharp')"
          >
            C# (.NET)
          </button>
        </div>

        <div class="rounded-xl border border-[#242e42] bg-[#080a0f] p-5 overflow-x-auto shadow-2xl">
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

