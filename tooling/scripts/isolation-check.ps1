# Isolation Check Script
# Ensures DenemeOkut PRs do not modify ClassManagement or ExamAnalysis modules.

$forbiddenPaths = @(
    "src/modules/ClassManagement",
    "src/modules/ExamAnalysis"
)

# Get list of changed files (staged and unstaged)
$changedFiles = git diff --name-only HEAD
$stagedFiles = git diff --name-only --cached

$allFiles = $changedFiles + $stagedFiles | Select-Object -Unique

$violationFound = $false

foreach ($file in $allFiles) {
    foreach ($path in $forbiddenPaths) {
        if ($file -like "$path*") {
            Write-Host "🚨 VIOLATION: Forbidden file modification detected!" -ForegroundColor Red
            Write-Host "   File: $file" -ForegroundColor Yellow
            $violationFound = $true
        }
    }
}

if ($violationFound) {
    Write-Host "`n❌ Isolation Check FAILED." -ForegroundColor Red
    Write-Host "   You are not allowed to modify 'ClassManagement' or 'ExamAnalysis' modules."
    Write-Host "   Please revert changes to these files."
    exit 1
} else {
    Write-Host "✅ Isolation Check PASSED." -ForegroundColor Green
    exit 0
}
