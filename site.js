const githubRepository = "mrdingobarry67-star/zx9-tweaks-website";
const repositoryIsConfigured = !githubRepository.startsWith("YOUR-");
const releasePage = repositoryIsConfigured
  ? `https://github.com/${githubRepository}/releases`
  : "#community";

document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll(".repository-link").forEach((link) => {
  link.href = repositoryIsConfigured
    ? `https://github.com/${githubRepository}`
    : "#community";
});

document.querySelectorAll(".discussions-link").forEach((link) => {
  link.href = repositoryIsConfigured
    ? `https://github.com/${githubRepository}/issues`
    : "#community";
});

const releaseLink = document.getElementById("release-notes-link");
releaseLink.href = releasePage;

for (const button of document.querySelectorAll(".download-link")) {
  button.addEventListener("click", (event) => {
    if (button.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
    }
  });
}

function formatFileSize(bytes) {
  if (bytes <= 0) return "Size not listed";
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes < 100 ? megabytes.toFixed(1) : Math.round(megabytes)} MB`;
}

async function loadLatestRelease() {
  if (!repositoryIsConfigured) {
    document.getElementById("update-detail").textContent =
      "Set your public GitHub repository in site.js, then publish a release containing ZX9-win-x64.zip to enable downloads and automatic update information.";
    return;
  }

  document.querySelectorAll(".repository-link").forEach((link) => {
    link.href = `https://github.com/${githubRepository}`;
  });
  document.querySelectorAll(".discussions-link").forEach((link) => {
    link.href = `https://github.com/${githubRepository}/issues`;
  });
  document.querySelectorAll("#release-notes-link, .release-card .text-link").forEach((link) => {
    link.href = releasePage;
  });

  try {
    const response = await fetch(`https://api.github.com/repos/${githubRepository}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (response.status === 404) {
      document.getElementById("update-detail").textContent =
        "No public release has been published yet. Publish a release with ZX9-win-x64.zip to make downloads available.";
      return;
    }

    if (!response.ok) {
      throw new Error(`GitHub returned HTTP ${response.status}.`);
    }

    const release = await response.json();
    const asset = release.assets.find((item) => item.name === "ZX9-win-x64.zip");
    const digest = typeof asset?.digest === "string" ? asset.digest : "";
    const hasTrustedDigest = /^sha256:[0-9a-f]{64}$/i.test(digest);
    const version = release.tag_name || "Latest release";
    const releaseDate = new Date(release.published_at || release.created_at);
    const dateText = Number.isNaN(releaseDate.getTime())
      ? "Date not listed"
      : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(releaseDate);

    document.getElementById("release-version").textContent = version;
    document.getElementById("release-date").textContent = dateText;
    document.getElementById("update-title").textContent = `${version} · ${release.name || "ZX9 release"}`;
    document.getElementById("update-detail").textContent =
      release.body?.trim() || "See the release page for installation instructions and changes.";
    document.getElementById("release-summary").textContent =
      asset && hasTrustedDigest
        ? `${version} was published ${dateText}. Download ${asset.name} (${formatFileSize(asset.size)}). SHA-256: ${digest.slice("sha256:".length)}. Read the release notes before installing.`
        : asset
          ? `${version} was published ${dateText}, but GitHub has not provided the SHA-256 digest required to verify this package. Downloads remain disabled.`
        : `${version} was published ${dateText}, but it does not include the expected ZX9-win-x64.zip download yet.`;
    document.getElementById("download-meta").textContent = asset
      ? `${version} · ${formatFileSize(asset.size)}`
      : `${version} · Windows package not attached`;
    const checksum = document.getElementById("download-checksum");
    if (hasTrustedDigest) {
      checksum.textContent = `SHA-256: ${asset.digest.slice("sha256:".length)}`;
      checksum.hidden = false;
    }

    if (asset && hasTrustedDigest) {
      document.querySelectorAll(".download-link").forEach((button) => {
        button.href = asset.browser_download_url;
        button.removeAttribute("aria-disabled");
        button.classList.remove("is-disabled");
        button.setAttribute("download", asset.name);
      });
    } else if (asset) {
      document.getElementById("download-meta").textContent =
        `${version} · SHA-256 verification unavailable`;
    }
  } catch (error) {
    document.getElementById("update-detail").textContent =
      "Could not check GitHub releases right now. You can still visit the releases page to check for updates.";
    document.getElementById("release-summary").textContent =
      `Release check unavailable (${error.message}). Check the releases page directly.`;
  }
}

loadLatestRelease();
