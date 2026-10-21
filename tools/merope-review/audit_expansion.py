import cv2
from pathlib import Path
from PIL import Image,ImageDraw
PROJECT=Path(__file__).resolve().parents[2]
P=PROJECT/'build/merope-review-20260923/site_review'
for ds,rank in [('waymo',2),('waymo',3),('av2',3),('av2',8),('nuscenes',3),('nuscenes',4)]:
 for v in ['orig','left','right']:
  cap=cv2.VideoCapture(str(P/f'{ds}_{rank:02}_{v}.mp4'));frames=[]
  while True:
   ok,im=cap.read()
   if not ok:break
   frames.append(im)
  cap.release();assert len(frames)==49
  sheet=Image.new('RGB',(1400,1050),'white');d=ImageDraw.Draw(sheet)
  for n,im in enumerate(frames):
   im=Image.fromarray(cv2.cvtColor(im,cv2.COLOR_BGR2RGB));im.thumbnail((196,125));x=n%7*200;y=n//7*150;sheet.paste(im,(x,y+20));d.text((x,y),str(n),fill='black')
  sheet.save(P/f'expanded_{ds}_{rank:02}_{v}.jpg',quality=92)
 print(ds,rank,flush=True)
