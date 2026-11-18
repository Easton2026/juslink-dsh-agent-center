"""Build an npm-compatible tarball from a strict allowlist, excluding local state."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import tarfile
import zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=root / 'dist')
output = parser.parse_args().output.resolve()
output.mkdir(parents=True, exist_ok=True)
manifest = json.loads((root / 'package.json').read_text())
filename = 'juslink-agent-center-ui-' + manifest['version'] + '.tgz'
allowed = {'package.json': root / 'package.json', **{name: root / name for name in manifest['files']}}
with (output / filename).open('wb') as raw:
    with gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode='w') as archive:
            for name, source in allowed.items():
                content = source.read_bytes()
                info = tarfile.TarInfo('package/' + name)
                info.size = len(content)
                info.mode = 0o644
                info.mtime = 0
                archive.addfile(info, io.BytesIO(content))
digest = hashlib.sha256((output / filename).read_bytes()).hexdigest()
(output / (filename + '.sha256')).write_text(digest + '  ' + filename + '\n')
with tarfile.open(output / filename) as archive:
    assert set(archive.getnames()) == {'package/' + name for name in allowed}
    for member in archive.getmembers():
        body = archive.extractfile(member).read()
        assert b'/Users/' not in body, 'Local user path unexpectedly included'
zipname = filename.removesuffix('.tgz') + '.zip'
with zipfile.ZipFile(output / zipname, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name, source in allowed.items():
        archive.writestr('juslink-agent-center-ui/' + name, source.read_bytes())
zipdigest = hashlib.sha256((output / zipname).read_bytes()).hexdigest()
(output / (zipname + '.sha256')).write_text(zipdigest + '  ' + zipname + '\n')
print(json.dumps({'file': str(output / filename), 'sha256': digest,
                  'bytes': (output / filename).stat().st_size,
                  'files': list(allowed)}, ensure_ascii=False))
