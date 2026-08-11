$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$errors = New-Object System.Collections.Generic.List[string]
$htmlFiles = Get-ChildItem -LiteralPath $root -Recurse -Filter '*.html' -File | Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' }

function Add-Error([string]$message) { $errors.Add($message) }
function Match-Count([string]$text, [string]$pattern) { return [regex]::Matches($text, $pattern, 'IgnoreCase').Count }

foreach ($file in $htmlFiles) {
  $relative = $file.FullName.Substring($root.Length).TrimStart('\').Replace('\', '/')
  $html = [IO.File]::ReadAllText($file.FullName)
  $is404 = $relative -eq '404.html'

  if ((Match-Count $html '<script\s+async\s+src="https://www\.googletagmanager\.com/gtag/js\?id=G-8PFRRXPGEF"') -ne 1) { Add-Error "${relative}: GA loader missing or duplicated" }
  if ((Match-Count $html "gtag\('config','G-8PFRRXPGEF'\)") -ne 1) { Add-Error "${relative}: GA config missing or duplicated" }

  $ids = [regex]::Matches($html, '\sid="([^"]+)"', 'IgnoreCase') | ForEach-Object { $_.Groups[1].Value }
  $ids | Group-Object | Where-Object Count -gt 1 | ForEach-Object { Add-Error "${relative}: duplicate id '$($_.Name)'" }

  if ((Match-Count $html '<h1(?:\s|>)') -ne 1) { Add-Error "${relative}: expected exactly one H1" }
  if (-not $is404) {
    if ((Match-Count $html '<title>[^<]+</title>') -ne 1) { Add-Error "${relative}: missing/duplicate title" }
    if ((Match-Count $html '<meta\s+name="description"\s+content="[^"]+"') -ne 1) { Add-Error "${relative}: missing/duplicate meta description" }
    if ((Match-Count $html '<link\s+rel="canonical"\s+href="https://cablechecklab\.com/[^"]*"') -ne 1) { Add-Error "${relative}: missing/duplicate canonical" }
    foreach ($property in @('og:title','og:description','og:type','og:url')) {
      if ((Match-Count $html ('<meta\s+property="' + [regex]::Escape($property) + '"\s+content="[^"]+"')) -ne 1) { Add-Error "${relative}: missing/duplicate $property" }
    }
    $jsonMatches = [regex]::Matches($html, '<script\s+type="application/ld\+json">(.*?)</script>', 'Singleline,IgnoreCase')
    if ($jsonMatches.Count -eq 0) { Add-Error "${relative}: missing JSON-LD" }
    foreach ($jsonMatch in $jsonMatches) {
      try { $null = $jsonMatch.Groups[1].Value | ConvertFrom-Json } catch { Add-Error "${relative}: invalid JSON-LD" }
    }
  }

  $links = [regex]::Matches($html, '(?:href|src)="(/[^"]*)"', 'IgnoreCase') | ForEach-Object { $_.Groups[1].Value }
  foreach ($link in $links) {
    $path = ($link -split '[?#]')[0]
    if ($path -eq '/') { $target = Join-Path $root 'index.html' }
    elseif ($path.EndsWith('/')) { $target = Join-Path $root ($path.TrimStart('/').Replace('/', '\') + 'index.html') }
    else { $target = Join-Path $root $path.TrimStart('/').Replace('/', '\') }
    if (-not (Test-Path -LiteralPath $target)) { Add-Error "${relative}: missing internal target $link" }
  }
}

[xml]$sitemap = Get-Content -Raw -LiteralPath (Join-Path $root 'sitemap.xml')
$sitemapUrls = @($sitemap.urlset.url | ForEach-Object { $_.loc.TrimEnd('/') + '/' })
$expectedUrls = @($htmlFiles | Where-Object Name -ne '404.html' | ForEach-Object {
  $rel = $_.FullName.Substring($root.Length).TrimStart('\').Replace('\', '/')
  if ($rel -eq 'index.html') { 'https://cablechecklab.com/' }
  else { 'https://cablechecklab.com/' + ($rel -replace 'index\.html$', '') }
})
foreach ($url in $expectedUrls) { if ($url -notin $sitemapUrls) { Add-Error "sitemap missing $url" } }
foreach ($url in $sitemapUrls) { if ($url -notin $expectedUrls) { Add-Error "sitemap has non-page $url" } }

$titles = @{}
foreach ($file in ($htmlFiles | Where-Object Name -ne '404.html')) {
  $relative = $file.FullName.Substring($root.Length).TrimStart('\').Replace('\', '/')
  $html = [IO.File]::ReadAllText($file.FullName)
  $title = [regex]::Match($html, '<title>([^<]+)</title>', 'IgnoreCase').Groups[1].Value
  if ($titles.ContainsKey($title)) { Add-Error "duplicate title '$title' in $relative and $($titles[$title])" } else { $titles[$title] = $relative }
}

if ($errors.Count) {
  Write-Output "FAIL: $($errors.Count) issue(s)"
  $errors | ForEach-Object { Write-Output " - $_" }
  exit 1
}

Write-Output "PASS: $($htmlFiles.Count) public HTML files"
Write-Output "PASS: $($expectedUrls.Count) indexable pages match sitemap"
Write-Output 'PASS: GA4, metadata, JSON-LD, H1, duplicate IDs, and internal targets'
