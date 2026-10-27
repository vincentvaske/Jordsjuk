"""Exercise draft exclusion and real image transformation without touching live entries."""
import importlib.util,json,tempfile
from pathlib import Path
from PIL import Image
spec=importlib.util.spec_from_file_location('site_build',Path(__file__).with_name('build.py'));mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
original=mod.ROOT
with tempfile.TemporaryDirectory() as tmp:
 root=Path(tmp).resolve();mod.ROOT=root
 for name in ['index.html','content.html','contact.html','concerts.html','discography.html','style.css','script.js']:(root/name).write_text('test')
 (root/'favicon.ico').write_bytes(b'test')
 (root/'assets').mkdir();(root/'media/uploads').mkdir(parents=True)
 for kind in ['concerts','news','releases']:(root/'content'/kind).mkdir(parents=True)
 Image.new('RGB',(2400,1200),'red').save(root/'media/uploads/test.jpg')
 entry={'title':'Test','date':'2026-10-27','image':'media/uploads/test.jpg','published':True}
 (root/'content/news/live.json').write_text(json.dumps(entry));(root/'content/news/draft.json').write_text(json.dumps({**entry,'published':False}))
 data=mod.build();assert len(data['news'])==1
 image=root/'dist'/data['news'][0]['image'];assert image.exists()
 with Image.open(image) as im:assert im.size==(1800,900) and im.format=='WEBP'
 assert not (root/'dist/content').exists() and not (root/'dist/media/uploads').exists()
 (root/'content/news/live.json').write_text(json.dumps({**entry,'external_url':'javascript:alert(1)'}))
 try:mod.build()
 except ValueError:pass
 else:raise AssertionError('Unsafe URL accepted')
mod.ROOT=original
print('Passed: drafts excluded, uploaded image resized and converted, source uploads excluded, unsafe URL rejected.')
