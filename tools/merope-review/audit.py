import json
import shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import cv2
from PIL import Image, ImageDraw

PROJECT=Path(__file__).resolve().parents[2]
ROOT=PROJECT/'build/merope-review-20260923/site_review'
rows=json.loads((ROOT/'audit_candidates.json').read_text())

def audit(c):
    sheet=Image.new('RGB',(1400,450),'#101724')
    draw=ImageDraw.Draw(sheet)
    for i,variant in enumerate(['orig','left','right']):
        r=next(r for r in c['results'] if ('__'+variant in r['id'] if variant!='orig' else '__' not in r['id']))
        name=f"{c['dataset']}_{c['rank']:02}_{variant}"
        local=ROOT/(name+'.mp4')
        if not local.exists():shutil.copyfile(r['generated_video'],local)
        cap=cv2.VideoCapture(str(local));frames=[]
        while True:
            ok,im=cap.read()
            if not ok:break
            frames.append(im)
        cap.release();assert len(frames)==49
        draw.text((5,i*150+2),name,fill='white')
        for j,n in enumerate([0,8,16,24,32,40,48]):
            im=Image.fromarray(cv2.cvtColor(frames[n],cv2.COLOR_BGR2RGB));im.thumbnail((195,125))
            sheet.paste(im,(j*200,i*150+22))
        Image.fromarray(cv2.cvtColor(frames[16],cv2.COLOR_BGR2RGB)).save(ROOT/(name+'.jpg'),quality=92)
    sheet.save(ROOT/f"{c['dataset']}_{c['rank']:02}_audit.jpg",quality=92)
    print(c['dataset'],c['rank'],flush=True)

with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(audit,rows))
