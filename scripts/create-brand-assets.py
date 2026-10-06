"""Generate CinemaStream's code-drawn brand assets, without external dependencies."""
from pathlib import Path
import struct
import zlib

OUT = Path(__file__).resolve().parent.parent / 'assets' / 'images'
BG = (11, 13, 18, 255)
AMBER = (243, 166, 107, 255)


def png(path, size, transparent=False, scale=1):
    # Draw at twice the output size, then average for clean edges.
    n = size * 2
    pixels = bytearray(n * n * 4)
    for y in range(n):
        for x in range(n):
            u = (x / n - .5) / scale + .5
            v = (y / n - .5) / scale + .5
            ink = (.23 <= u <= .77 and .28 <= v <= .72)
            # Filmstrip perforations and a cut-out play symbol.
            hole = any(.31 + i * .095 <= v <= .355 + i * .095 for i in range(4)) and (.255 <= u <= .30 or .70 <= u <= .745)
            play = .43 <= u <= .62 and abs(v - .5) <= (.62 - u) * .68
            color = AMBER if ink and not hole and not play else (0, 0, 0, 0) if transparent else BG
            p = (y * n + x) * 4
            pixels[p:p + 4] = bytes(color)
    rows = bytearray()
    for y in range(size):
        rows.append(0)
        for x in range(size):
            indices = [(2 * y * n + 2 * x) * 4, (2 * y * n + 2 * x + 1) * 4,
                       ((2 * y + 1) * n + 2 * x) * 4, ((2 * y + 1) * n + 2 * x + 1) * 4]
            rows.extend(sum(pixels[i + c] for i in indices) // 4 for c in range(4))

    def chunk(kind, data):
        return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data) & 0xffffffff)
    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!2I5B', size, size, 8, 6, 0, 0, 0))
    path.write_bytes(data + chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b''))


OUT.mkdir(parents=True, exist_ok=True)
png(OUT / 'cinema-icon.png', 1024)
png(OUT / 'cinema-adaptive.png', 1024, transparent=True, scale=.8)
png(OUT / 'cinema-splash.png', 512, transparent=True)
png(OUT / 'cinema-favicon.png', 64)
print('Created four CinemaStream brand assets.')
