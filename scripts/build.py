"""Validate CMS content, optimize uploaded pictures, and create a static site."""
import argparse, hashlib, json, shutil
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[1]
def build(preview=False):
 out=ROOT/'dist'
 if out.exists(): shutil.rmtree(out)
 out.mkdir()
 shutil.copy2(ROOT/'favicon.ico',out/'favicon.ico')
 for name in ['index.html','content.html','contact.html','concerts.html','discography.html','style.css','script.js']:
  shutil.copy2(ROOT/name,out/name)
 shutil.copytree(ROOT/'assets',out/'assets')
 media=out/'media'/'optimized';media.mkdir(parents=True)
 data={}
 for kind in ['concerts','news','releases']:
  data[kind]=[]
  for path in sorted((ROOT/'content'/kind).glob('*.json')):
   entry=json.loads(path.read_text())
   for field in ['title']+(['date','city'] if kind=='concerts' else ['date'] if kind=='news' else ['year','image']):
    if not entry.get(field): raise ValueError(f'{path.name}: missing {field}')
   for field in ['date','digital_date','vinyl_date','cd_date']:
    if entry.get(field): date.fromisoformat(str(entry[field])[:10])
   for field in ['ticket_url','external_url','listening_url','spotify_url']:
    if entry.get(field) and urlsplit(entry[field]).scheme not in ['http','https']: raise ValueError(f'{path.name}: invalid {field}')
   if not entry.get('published',False): continue
   entry['id']=path.stem
   image=entry.get('image','').lstrip('/')
   if image:
    source=(ROOT/image).resolve()
    if not source.is_relative_to(ROOT) or not source.is_file(): raise ValueError(f'{path.name}: missing or invalid picture {image}')
    if image.startswith('media/uploads/'):
     digest=hashlib.sha256(source.read_bytes()).hexdigest()[:20]
     filename=digest+'.webp'
     with Image.open(source) as original:
      im=ImageOps.exif_transpose(original).convert('RGBA' if 'A' in original.getbands() else 'RGB')
      im.thumbnail((1800,1800));im.save(media/filename,'WEBP',quality=85,method=6)
     entry['image']='media/optimized/'+filename
    else: entry['image']=image
   data[kind].append(entry)
 (out/'data').mkdir();(out/'data/content.json').write_text(json.dumps(data,ensure_ascii=False))
 if preview:
  (ROOT/'data').mkdir(exist_ok=True);shutil.copy2(out/'data/content.json',ROOT/'data/content.json')
  shutil.copytree(media,ROOT/'media/optimized',dirs_exist_ok=True)
 print(f'Built {sum(map(len,data.values()))} published entries → {out}')
 return data
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--preview',action='store_true');args=parser.parse_args();build(args.preview)
