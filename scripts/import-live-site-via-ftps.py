#!/usr/bin/env python3
"""READ-ONLY import of the working live cPanel files into the GitHub release branch.

FTPS credentials arrive through GitHub Actions secrets, never source control.
No FTP STOR/DELE/RNFR commands are sent to the user's hosting account.
"""
import ftplib
import hashlib
import json
import os
import ssl
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
EXPECTED = json.loads((ROOT / "scripts" / "protected-digests.json").read_text())
EXPECTED.update({
    "index.html": "99c11b002dba7425c27a16f8a6f00839ee85bc9a645b4eabfe24a8e0572d3567",
    "css/cinematic-polish.css": "bc5522ddd5fee9cabfa3f80d85be74eac68dfcd415514359584b57d12561b91b",
    "js/cinematic-polish.js": "65302c5de3a9f54080b50771f56c531c356ac9cf59fa2c46f59860173157da5a",
})

host = os.getenv("CPANEL_FTP_HOST", "").strip()
# The hosting server presented a verified Let\'s Encrypt certificate for this
# canonical hostname (not the ftp.akogs-fashion.com domain alias).
if host == "ftp.akogs-fashion.com":
    host = "bdix10.ebnserver.com"
user = os.getenv("CPANEL_FTP_USERNAME", "").strip()
password = os.getenv("CPANEL_FTP_PASSWORD", "")
directory = os.getenv("CPANEL_FTP_REMOTE_DIR", "").strip()
if not all((host, user, password, directory)):
    sys.exit("Missing FTP connection secrets. Live site was not modified.")
if directory in ("/", ""):
    sys.exit("Refusing an ambiguous FTP root; use the verified PinFlix account directory.")

# Do not dump any secret values to CI logs.
ftp = ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=30)
try:
    ftp.connect(host, 21, timeout=30)
    try:
        ftp.login(user, password)
    except ftplib.error_perm as error:
        if str(error).startswith("530"):
            sys.exit("FTP login rejected (530). Confirm the existing FTP username and reset the password in cPanel, then update the matching GitHub secret. No site files changed.")
        raise
    ftp.prot_p()
    ftp.set_pasv(True)
    ftp.cwd(directory)
    for name, expected in sorted(EXPECTED.items()):
        if name.startswith("/") or ".." in Path(name).parts:
            raise ValueError("Invalid destination path")
        dest = SITE / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        with dest.open("wb") as out:
            ftp.retrbinary(f"RETR {name}", out.write, blocksize=65536)
        current = hashlib.sha256(dest.read_bytes()).hexdigest()
        if current != expected:
            raise ValueError(f"Checksum mismatch in protected site file: {name}")
        print(f"Verified live site file: {name} ({dest.stat().st_size} bytes)")
finally:
    try:
        ftp.quit()
    except (OSError, EOFError, ftplib.Error):
        ftp.close()
print(f"Read-only FTPS import and SHA-256 verification passed: {len(EXPECTED)} files.")
