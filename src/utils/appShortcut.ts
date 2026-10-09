/**
 * Utility functions for creating desktop shortcuts and triggering PWA installation.
 */

export function downloadWindowsShortcut(
  targetUrl: string = window.location.href,
  fileName: string = 'SME-Sentinel-Early-Warning.url'
) {
  // Windows Internet Shortcut format (.url)
  const fileContent = `[InternetShortcut]\r\nURL=${targetUrl}\r\nIconIndex=0\r\nIconFile=C:\\Windows\\System32\\shell32.dll\r\nHotKey=0\r\n[{000214A0-0000-0000-C000-000000000046}]\r\nProp3=19,11\r\n`;

  const blob = new Blob([fileContent], { type: 'application/internet-shortcut;charset=utf-8' });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}

export function downloadWindowsBatchLauncher(
  targetUrl: string = window.location.href,
  fileName: string = 'Launch-SME-Sentinel.bat'
) {
  // Windows Batch File that launches default browser to the web app
  const fileContent = `@echo off\r\nREM SME-SENTINEL Launcher\r\necho Launching SME-SENTINEL Financial Stress Early-Warning Platform...\r\nstart "" "${targetUrl}"\r\nexit\r\n`;

  const blob = new Blob([fileContent], { type: 'application/bat;charset=utf-8' });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}

// Global reference for native PWA beforeinstallprompt event
let globalInstallPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalInstallPrompt = e;
  });
}

export function getInstallPrompt() {
  return globalInstallPrompt;
}

export async function promptPWAInstall(): Promise<boolean> {
  if (globalInstallPrompt) {
    try {
      globalInstallPrompt.prompt();
      const choiceResult = await globalInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        globalInstallPrompt = null;
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

export function downloadMobileShortcutHtml(
  targetUrl: string = window.location.href,
  fileName: string = 'SME-Sentinel-Mobile.html'
) {
  // Standalone Mobile Launcher file that can be opened on iPhone / Android
  const fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="SME-SENTINEL">
  <title>SME-SENTINEL Mobile</title>
  <style>
    body {
      background: #0a0d12;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      background: #121721;
      border: 1px solid #1e293b;
      padding: 28px;
      border-radius: 20px;
      max-width: 340px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    h2 { font-size: 20px; margin: 0 0 8px; color: #38bdf8; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 20px; }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      color: white;
      padding: 12px 28px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
    }
  </style>
  <script>
    setTimeout(function() {
      window.location.replace("${targetUrl}");
    }, 400);
  </script>
</head>
<body>
  <div class="card">
    <h2>SME-SENTINEL</h2>
    <p>Launching AI Financial Early Warning Platform...</p>
    <a class="btn" href="${targetUrl}">Open SME-Sentinel</a>
  </div>
</body>
</html>`;

  const blob = new Blob([fileContent], { type: 'text/html;charset=utf-8' });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}

export async function shareToMobileDevice(targetUrl: string = window.location.href): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'SME-SENTINEL Early Warning Platform',
        text: 'Access SME-SENTINEL National Financial Stress Intelligence Platform on your phone',
        url: targetUrl,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

