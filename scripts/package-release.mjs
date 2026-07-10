import { cp, mkdir, rm, writeFile, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, ".next", "standalone");
const staticDir = path.join(rootDir, ".next", "static");
const publicDir = path.join(rootDir, "public");
const releaseDir = path.join(rootDir, "webnovel-v1.0.0");
const bundledNode = "C:\\Users\\ASUS\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe";

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(source, target) {
  if (!(await exists(source))) {
    return false;
  }

  await cp(source, target, { recursive: true });
  return true;
}

async function main() {
  if (!(await exists(standaloneDir))) {
    throw new Error("Missing .next/standalone. Run `npm run build` first.");
  }

  await rm(releaseDir, { recursive: true, force: true });
  await mkdir(releaseDir, { recursive: true });

  await cp(standaloneDir, releaseDir, { recursive: true });

  const releaseStaticDir = path.join(releaseDir, ".next", "static");
  await mkdir(path.dirname(releaseStaticDir), { recursive: true });
  await copyIfExists(staticDir, releaseStaticDir);
  await copyIfExists(publicDir, path.join(releaseDir, "public"));
  await copyIfExists(bundledNode, path.join(releaseDir, "node.exe"));

  const startBat = [
    "@echo off",
    "setlocal",
    "cd /d %~dp0",
    "echo Starting WebNovel Writer...",
    "if exist server.log del /q server.log >nul 2>nul",
    "start \"WebNovel Writer Server\" /min cmd /c \"\"%~dp0node.exe\" server.js > server.log 2>&1\"",
    "set \"URL=http://127.0.0.1:3000\"",
    "call :wait_for_server",
    "start \"\" \"%URL%\"",
    "echo Opened %URL%",
    "echo Server logs: server.log",
    "pause",
    "exit /b",
    "",
    ":wait_for_server",
    "set \"TRIES=0\"",
    ":retry",
    "powershell -NoProfile -Command \"try { $r = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { exit 0 } exit 1 } catch { exit 1 }\" >nul 2>nul",
    "if %errorlevel%==0 exit /b 0",
    "set /a TRIES+=1",
    "if %TRIES% GEQ 60 (",
    "  echo Server did not respond in time. Check server.log.",
    "  exit /b 1",
    ")",
    "timeout /t 1 /nobreak >nul",
    "goto retry",
    "",
  ].join("\r\n");

  const startPs1 = [
    "Set-StrictMode -Version Latest",
    "$ErrorActionPreference = 'Stop'",
    "Set-Location $PSScriptRoot",
    "Write-Host 'Starting WebNovel Writer...'",
    "if (Test-Path \"$PSScriptRoot\\server.log\") { Remove-Item \"$PSScriptRoot\\server.log\" -Force }",
    "Start-Process -WindowStyle Minimized -FilePath \"$PSScriptRoot\\node.exe\" -ArgumentList 'server.js' -WorkingDirectory $PSScriptRoot -RedirectStandardOutput \"$PSScriptRoot\\server.log\" -RedirectStandardError \"$PSScriptRoot\\server.log\"",
    "$url = 'http://127.0.0.1:3000'",
    "for ($i = 0; $i -lt 60; $i++) {",
    "  try {",
    "    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2",
    "    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { break }",
    "  } catch { }",
    "  Start-Sleep -Seconds 1",
    "}",
    "Start-Process $url",
    "Write-Host \"Opened $url\"",
    "",
  ].join("\r\n");

  const readme = [
    "WebNovel Writer 发布包",
    "",
    "启动方式：",
    "1. 直接双击 `start.bat`，或在 PowerShell 中运行 `./start.ps1`。",
    "3. 打开浏览器访问 http://localhost:3000。",
    "",
    "说明：",
    "- 这是 standalone 发布包，已经自带 `node.exe`，不需要重新 npm install，也不需要另外安装 Node.js。",
    "- 如果你把整个 release 文件夹压缩后发给别人，对方解压后直接启动即可。",
    "",
  ].join("\r\n");

  await writeFile(path.join(releaseDir, "start.bat"), startBat, "utf8");
  await writeFile(path.join(releaseDir, "start.ps1"), startPs1, "utf8");
  await writeFile(path.join(releaseDir, "README.txt"), readme, "utf8");

  console.log(`Release package prepared at ${releaseDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
