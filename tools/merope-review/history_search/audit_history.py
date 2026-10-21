import json,shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import cv2
from PIL import Image,ImageDraw
PROJECT=Path(__file__).resolve().parents[3]
ROOT=PROJECT/'build/merope-review-20260923/site_review/history_search'
rows=json.loads((ROOT/'all_candidates.json').read_text())
chosen=[c for c in rows if c['search_rank'] in [2,3,4,6,7,8,9,10]]
def audit(c):
 sheet=Image.new('RGB',(1400,300),'white');d=ImageDraw.Draw(sheet)
 for i,v in enumerate(['left','right']):
  r=next(r for r in c['results'] if r['id'].endswith('__'+v));f=ROOT/f"{c['search_rank']:02}_{v}.mp4"
  if not f.exists():shutil.copyfile(r['generated_video'],f)
  cap=cv2.VideoCapture(str(f));frames=[]
  while True:
   ok,im=cap.read()
   if not ok:break
   frames.append(im)
  cap.release();assert len(frames)==49
  for j,n in enumerate([0,8,16,24,32,40,48]):
   im=Image.fromarray(cv2.cvtColor(frames[n],cv2.COLOR_BGR2RGB));im.thumbnail((196,125));sheet.paste(im,(j*200,i*150+22))
  d.text((4,i*150+4),f"History search {c['search_rank']} {v} {c['id'][-8:]}",fill='black')
 sheet.save(ROOT/f"{c['search_rank']:02}_audit.jpg",quality=93);print(c['search_rank'],flush=True)
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(audit,chosen))
