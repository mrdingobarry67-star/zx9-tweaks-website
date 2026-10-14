# Publish the ZX9 Tweaks website

This is a static website for GitHub Pages. It checks the public GitHub Releases API for the latest release and enables the download buttons only when that release contains `ZX9-win-x64.zip` and GitHub reports its SHA-256 asset digest. The confirmed `mrdingobarry67-star/zx9-tweaks-website` repository is public, so the site and release downloads are available without a GitHub login. Do not publish private information or secrets in this repository or its public releases.

## 1. Create a free GitHub website repository

1. Your public GitHub repository already exists at `https://github.com/mrdingobarry67-star/zx9-tweaks-website`. Its existing `index.html` is an earlier page; publish the updated site files into the same repository.
2. The website and app are configured to use `mrdingobarry67-star/zx9-tweaks-website` for public releases. Public repositories make release assets available without a GitHub login. If you change the repository later, update both `site.js` and the `GitHubRepository` constant in `src\ZX9.App\GitHubUpdateService.cs`.
3. Rebuild ZX9 after changing the updater repository setting. The setting is compiled into the app so an installed release knows where to check for updates.

You can upload the files through GitHub's web interface, or use Git for Windows in PowerShell:

```powershell
git clone https://github.com/mrdingobarry67-star/zx9-tweaks-website.git "$env:TEMP\zx9-tweaks-website"
Copy-Item -Path ".\website\*" -Destination "$env:TEMP\zx9-tweaks-website" -Recurse -Force
Copy-Item -Path ".\website\.github" -Destination "$env:TEMP\zx9-tweaks-website\.github" -Recurse -Force
Copy-Item -Path ".\website\README.md" -Destination "$env:TEMP\zx9-tweaks-website\WEBSITE-SETUP.md" -Force
Set-Location "$env:TEMP\zx9-tweaks-website"
Remove-Item .\style.css, .\script.js -Force -ErrorAction SilentlyContinue
git add -A
git status --short
git commit -m "Update ZX9 website and planned feature library"
git push origin main
```

Run these commands from the ZX9 project folder after signing in to GitHub if prompted. Review `git status` before committing. The site's publishing instructions are saved as `WEBSITE-SETUP.md` so they do not replace the project README. The old `style.css` and `script.js` are no longer used by the new page. The `downloads` folder contains only a `.gitignore` file; the generated ZIP is intentionally not copied into the website repository. Do not upload the whole ZX9 application source unless you intend to publish it.

## 2. Enable GitHub Pages

The included `.github/workflows/deploy-pages.yml` publishes the static site when you push changes to `main`.

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Open **Actions** and confirm that **Deploy ZX9 website to GitHub Pages** completes successfully.
4. GitHub will show the public URL under **Settings → Pages**, usually `https://mrdingobarry67-star.github.io/zx9-tweaks-website/`.

The included workflow publishes only the website pages, not the app source, workflow files, or local download archive.

## 3. Build and publish a Windows download

The website remains in preview mode until a release is published. Do not call a build stable until it has been tested on a separate clean Windows PC. Configure the release repository in both `site.js` and `src\ZX9.App\GitHubUpdateService.cs` before building the public app.

1. The current project targets .NET 9. Verify compatibility and consider moving to a supported .NET LTS release before a public launch. The current app version is `1.0.1`, set by `<Version>` in `src\ZX9.App\ZX9.App.csproj`; increment it for every release.
2. Build a self-contained x64 release from the ZX9 project folder:

   ```powershell
   dotnet publish .\src\ZX9.App\ZX9.App.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o .\publish\win-x64
   Compress-Archive -Path .\publish\win-x64\ZX9.App.exe -DestinationPath .\website\downloads\ZX9-win-x64.zip -Force
   ```

3. The ZIP contains the self-contained single-file executable `ZX9.App.exe`. Test it on a separate clean Windows PC before release. In the public GitHub repository, choose **Releases → Draft a new release**, create the tag `v1.0.1` for app version `1.0.1.0`, attach `ZX9-win-x64.zip`, add accurate release notes, then publish. GitHub should report the uploaded asset's SHA-256 digest in release metadata.
4. The website displays the release version, date, notes, package size, and SHA-256 digest. Its download buttons activate only when the package and digest are present. The app checks this same repository at startup and in Settings. When it finds a higher stable version, it asks before downloading and replacing the portable app files; the download must match the GitHub-published asset size and SHA-256 digest. The updater stages files and keeps rollback backups for a failed update; protected install folders may prompt for Windows elevation.

ZX9's self-updater is designed for an extracted portable app folder. It downloads only the exact `ZX9-win-x64.zip` release asset over HTTPS, requires and verifies GitHub's SHA-256 digest and file size, checks archive paths before extraction, stages changes, retains rollback files if an update fails, and restarts ZX9 after the user approves the update. Keep publishing trusted assets to the configured public repository. Test installation, update, rollback, administrator prompts, and uninstall on a test PC. Code signing can help users identify the publisher but does not guarantee that SmartScreen warnings disappear. Never ask users to turn off Windows Defender or the firewall.

## 4. Add a custom domain later (optional)

Buy a domain from a domain registrar, then enter it under **Settings → Pages → Custom domain** and configure the DNS records GitHub provides. The free `github.io` address works without buying a domain.

## Updating the site

Edit the website files and push the changes to the repository's `main` branch. The workflow redeploys the site. To publish an app update, increment `<Version>` in `src\ZX9.App\ZX9.App.csproj`, rebuild and test the ZIP, then publish a higher matching GitHub release tag with updated notes and the `ZX9-win-x64.zip` asset. The site displays the new release; configured installed app builds offer it at startup or the next manual update check.
