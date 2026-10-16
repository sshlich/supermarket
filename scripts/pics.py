"""Makes the picture discs (src/discs/earth.md, src/discs/sky.md): twenty public-domain pictures from Wikimedia Commons,
each fitted into 160 by 120, dithered to the computer's sixteen colours (PALETTE in src/pics.ts), and packed two pixels
a byte, in base64, as a file `# NAME.PIC` on the disc. INDEX.TXT on each disc says what each picture is.

Run: python3 scripts/pics.py   (needs Pillow and the network; prints each picture's licence, so a non-PD one shows up)
"""
import base64, io, json, re, sys, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
UA = 'supermarket-game-dev/0.1 (picture disc build script)'
W, H = 160, 120

EARTH = [
    ('WAVE', 'Tsunami by hokusai 19th century.jpg', 'The Great Wave off Kanagawa. Katsushika Hokusai, about 1831.'),
    ('STARRY', 'Van Gogh - Starry Night - Google Art Project.jpg', 'The Starry Night. Vincent van Gogh, 1889.'),
    ('MONALISA', 'Mona Lisa, by Leonardo da Vinci, from C2RMF retouched.jpg', 'Mona Lisa. Leonardo da Vinci, about 1503.'),
    ('SCREAM', 'Edvard Munch, 1893, The Scream, oil, tempera and pastel on cardboard, 91 x 73 cm, National Gallery of Norway.jpg', 'The Scream. Edvard Munch, 1893.'),
    ('PEARL', '1665 Girl with a Pearl Earring.jpg', 'Girl with a Pearl Earring. Johannes Vermeer, about 1665.'),
    ('WANDERER', 'Caspar David Friedrich - Wanderer above the sea of fog.jpg', 'Wanderer above the Sea of Fog. Caspar David Friedrich, about 1818.'),
    ('HUNTERS', 'Pieter Bruegel the Elder - Hunters in the Snow (Winter) - Google Art Project.jpg', 'Hunters in the Snow. Pieter Bruegel the Elder, 1565.'),
    ('SUNRISE', 'Monet - Impression, Sunrise.jpg', 'Impression, Sunrise. Claude Monet, 1872.'),
    ('SUNFLWRS', 'Vincent Willem van Gogh 127.jpg', 'Sunflowers. Vincent van Gogh, 1888.'),
    ('HAYWAIN', 'John Constable The Hay Wain.jpg', 'The Hay Wain. John Constable, 1821.'),
]
SKY = [
    ('EARTHRIS', 'NASA Earthrise AS08-14-2383 Apollo 8 1968-12-24.jpg', 'Earthrise. Apollo 8, 24 December 1968.'),
    ('MARBLE', 'The Earth seen from Apollo 17.jpg', 'The Blue Marble. Apollo 17, 7 December 1972.'),
    ('ALDRIN', 'Aldrin Apollo 11 original.jpg', 'Buzz Aldrin on the Moon. Apollo 11, 1969.'),
    ('BOOT', 'Apollo 11 bootprint.jpg', 'A bootprint in the dust of the Moon. Apollo 11, 1969. Nothing there moves it; it will still be there.'),
    ('SATURN', 'Saturn during Equinox.jpg', 'Saturn at equinox. Cassini, 2008.'),
    ('JUPITER', 'Jupiter and its shrunken Great Red Spot.jpg', 'Jupiter. Hubble, 2014.'),
    ('PILLARS', 'Eagle nebula pillars.jpg', 'The Pillars of Creation, in the Eagle Nebula. Hubble, 1995.'),
    ('CRAB', 'Crab Nebula.jpg', 'The Crab Nebula, what is left of a star seen to explode in 1054. Hubble, 2005.'),
    ('ISS', 'International Space Station after undocking of STS-132.jpg', 'The International Space Station. From Atlantis, 2010.'),
    ('COLUMBIA', 'Space Shuttle Columbia launching.jpg', 'Columbia, the first shuttle, leaving. STS-1, 12 April 1981.'),
]


def palette():
    src = (ROOT / 'src/pics.ts').read_text()
    m = re.search(r"export const PALETTE = \[([^\]]+)\]", src)
    return [tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) for h in re.findall(r"#([0-9a-fA-F]{6})", m.group(1))]


def get(url):
    for wait in (2, 5, 15, 40, 90):  # Commons asks for patience: back off when it says too many
        try:
            time.sleep(1)
            return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30).read()
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(wait)
    sys.exit(f'gave up on {url}')


CACHE = Path('/tmp/pics-cache')


def fetch(title):
    """The picture and its licence, downloaded once (kept in /tmp/pics-cache, so a rerun asks Commons for nothing)."""
    key = CACHE / re.sub(r'[^A-Za-z0-9.]+', '_', title)
    if key.exists():
        meta = json.loads(key.with_suffix('.json').read_text())
        return Image.open(key).convert('RGB'), meta['licence']
    img, licence, raw = download(title)
    CACHE.mkdir(exist_ok=True)
    key.write_bytes(raw)
    key.with_suffix('.json').write_text(json.dumps({'licence': licence}))
    return img, licence


def download(title):
    q = urllib.parse.urlencode({'action': 'query', 'titles': f'File:{title}', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 480, 'format': 'json'})
    page = next(iter(json.loads(get(f'https://commons.wikimedia.org/w/api.php?{q}'))['query']['pages'].values()))
    if 'imageinfo' not in page:
        sys.exit(f'not on Commons: {title}')
    info = page['imageinfo'][0]
    licence = info.get('extmetadata', {}).get('LicenseShortName', {}).get('value', '?')
    raw = get(info['thumburl'])
    return Image.open(io.BytesIO(raw)).convert('RGB'), licence, raw


def dither(img, pal):
    img = ImageEnhance.Color(img).enhance(1.25)  # a little more colour: sixteen colours flatten it
    img = ImageEnhance.Contrast(img).enhance(1.1)
    k = min(W / img.width, H / img.height)  # fitted whole, on black
    img = img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)
    canvas = Image.new('RGB', (W, H))
    canvas.paste(img, ((W - img.width) // 2, (H - img.height) // 2))
    p = Image.new('P', (1, 1))
    p.putpalette([c for rgb in pal for c in rgb] + [0] * (768 - 3 * len(pal)))
    return canvas.quantize(palette=p, dither=Image.Dither.FLOYDSTEINBERG)


def pack(q):
    px = list(q.getdata())
    return base64.b64encode(bytes((px[i] << 4) | px[i + 1] for i in range(0, len(px), 2))).decode()


def disc(path, meta, intro, pics, pal):
    out = ['---', *[f'{k}: {v}' for k, v in meta.items()], '---', '# INDEX.TXT', intro, '']
    out += [f'{name}.PIC  {caption}' for name, _, caption in pics]
    for name, title, _ in pics:
        img, licence = fetch(title)
        print(f'{name:9} {licence:22} {title}')
        q = dither(img, pal)
        if '--preview' in sys.argv:  # a look at each, three times its size
            q.convert('RGB').resize((W * 3, H * 3), Image.NEAREST).save(f'/tmp/pic-{name}.png')
        out += ['', f'# {name}.PIC', pack(q)]
    path.write_text('\n'.join(out) + '\n')


if __name__ == '__main__':
    pal = palette()
    disc(ROOT / 'src/discs/earth.md', {'label': 'EARTH, AS PAINTED', 'colour': '#3a5a7a', 'blurb': 'A blue disc in a sleeve printed with a sea. Ten pictures of a world nobody on the station has stood on.', 'price': 6},
         'Ten paintings of Earth, scanned long ago and passed from disc to disc. Open them in Pictures; copy one to C: to make it your wallpaper.', EARTH, pal)
    disc(ROOT / 'src/discs/sky.md', {'label': 'THE LONG WAY OUT', 'colour': '#1a1a2a', 'blurb': 'A black disc, its label a photo of Earth from very far away. The pictures that got people up here.', 'price': 6},
         'Ten photographs from the first years of going up: the Earth, the Moon, the planets, and further. Open them in Pictures; copy one to C: to make it your wallpaper.', SKY, pal)
