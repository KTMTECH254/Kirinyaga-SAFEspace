$file = 'lib/supabase.ts'

if (Test-Path -LiteralPath $file) {
  $contents = [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $file))
  $sanitized = [System.Text.RegularExpressions.Regex]::Replace(
    $contents,
    "const SERVICE_ROLE_KEY = '[^']*';",
    'const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY;'
  )

  if ($sanitized -ne $contents) {
    [System.IO.File]::WriteAllText((Resolve-Path -LiteralPath $file), $sanitized)
  }
}
