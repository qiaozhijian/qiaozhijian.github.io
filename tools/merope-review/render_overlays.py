"""Render selected evaluation clips with calibrated trajectories; retain native frames."""
import sys,json,hashlib
from pathlib import Path
import numpy as np
from PIL import Image

SITE=Path(__file__).resolve().parents[2]
ROOT=SITE/'build/merope-review-20260923/site_review'
DEMO=SITE.parent/'merope-paper/build/supplementary/merope-demo-review-20260923'
sys.path.insert(0,str(DEMO/'overlay_fix'))
from render import viz,decode,encode
store=viz.CameraGeometryStore(Path('/cfs/common_users/zhijian.qiao/datasets/wan22_ti2v_5b/multisource_fullframe_49f_v1/evaluation/multisource-fullframe49-geostress10/pose_geometry'))
rows=json.loads((ROOT/'audit_candidates.json').read_text())
gallery=json.loads((SITE/'_data/merope_demo_gallery.json').read_text())
receipt_path=ROOT/'overlay_assets.json'
previous=json.loads(receipt_path.read_text()) if receipt_path.exists() else []
receipts=[]
for dataset in gallery['driving']:
 ds=dataset['id']
 for scene in dataset['scenes']:
  rank=scene['rank']
  c=next(c for c in rows if c['dataset']==ds and c['rank']==rank)
  dest=SITE/scene['path'].lstrip('/')
  old=[r for r in previous if r['dataset']==ds and r['rank']==rank]
  if '--only-new' in sys.argv and len(old)==3 and all((SITE/r['destination']).exists() for r in old):
   receipts.extend(old)
   continue
  dest.mkdir(parents=True,exist_ok=True)
  orig=np.array(next(t for t in c['clips'] if t['variant']=='orig')['traj']['gt_t'])
  for v in ['left','orig','right']:
   clip=next(t for t in c['clips'] if t['variant']==v)
   r=next(r for r in c['results'] if r['id']==clip['sample_id'])
   K,h,down=viz.camera_from_record(store.get(clip['sample_id']))
   traj=dict(clip['traj']);traj['scale_t']=(np.array(traj['pred_raw_t'])*traj['scale_factor']).tolist()
   frames=decode(ROOT/f'{ds}_{rank:02}_{v}.mp4');obj=viz.ClipData.from_traj(v,frames,traj,K,h,down,[])
   output=[]
   for n in range(49):
    im=viz.overlay_clip_frame(obj,n,Image.fromarray(frames[n]))
    w,ih=im.size;size=max(96,min(176,round(ih*128/288)))
    bev=viz.bev_panel(orig,obj.gt_t,obj.scale_t,n,size,v)
    bev.thumbnail((w//4,w//4),Image.Resampling.LANCZOS)
    im.paste(bev,(w-bev.width-6,6),bev)
    output.append(np.asarray(im))
   path=dest/f'{v}-overlay.mp4';encode(path,output)
   Image.fromarray(output[16]).save(dest/f'{v}-overlay.jpg',quality=94)
   receipts.append({'dataset':ds,'rank':rank,'variant':v,'id':r['id'],'source':r['generated_video'],'destination':str(path.relative_to(SITE)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'frames':49,'projection':'Fixed world-down ground-path projection, recovered camera pose; BEV limited to 25% of frame width.'})
  print(ds,rank,flush=True)
receipt_path.write_text(json.dumps(receipts,indent=2))
