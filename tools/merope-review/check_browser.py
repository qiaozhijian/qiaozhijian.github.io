"""Check the isolated local Chrome preview; never connects to a personal profile."""
import base64
import json
import time
import urllib.request
from pathlib import Path
import websocket

PROJECT=Path(__file__).resolve().parents[2]
OUT=PROJECT/'build/merope-review-20260923/site_review'
tabs=json.load(urllib.request.urlopen('http://127.0.0.1:9231/json'))
tab=next(t for t in tabs if t.get('url','').startswith('http://127.0.0.1:4010/merope/'))
ws=websocket.create_connection(tab['webSocketDebuggerUrl'],origin='http://localhost:9231',timeout=20)
counter=0
def call(method,params=None):
    global counter
    counter+=1;ws.send(json.dumps({'id':counter,'method':method,'params':params or {}}))
    while True:
        data=json.loads(ws.recv())
        if data.get('id')==counter:
            if 'error' in data:raise RuntimeError(data['error'])
            return data['result']
def evaluate(js):
    r=call('Runtime.evaluate',{'expression':js,'returnByValue':True,'awaitPromise':True})
    if 'exceptionDetails' in r:raise RuntimeError(r['exceptionDetails'])
    return r['result'].get('value')
def screenshot(name):
    data=call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})
    (OUT/name).write_bytes(base64.b64decode(data['data']))

def wait_for(js):
    deadline=time.monotonic()+12
    while time.monotonic()<deadline:
        if evaluate(js):return
        time.sleep(.2)
    raise AssertionError(js)

def videos_state(selector):
    return evaluate(f"Array.from(document.querySelectorAll({json.dumps(selector)})).map(v=>({{ready:v.readyState,error:v.error?.message||null,time:v.currentTime,paused:v.paused,src:v.currentSrc,width:v.videoWidth,height:v.videoHeight}}))")

def check_group(selector):
    evaluate(f"document.querySelector({json.dumps(selector)}).scrollIntoView({{block:'center'}})")
    wait_for(f"Array.from(document.querySelectorAll({json.dumps(selector+' video')})).every(v=>v.readyState>=3 && !v.paused && !v.error)")
    time.sleep(.4)
    state=videos_state(selector+' video')
    assert len(state)==3 and max(v['time'] for v in state)-min(v['time'] for v in state)<.3,state
    return state

if '--geometry' in __import__('sys').argv:
    call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1100,'deviceScaleFactor':1,'mobile':False})
    call('Page.reload',{'ignoreCache':True});time.sleep(2)
    evaluate("document.documentElement.style.scrollBehavior='auto';document.querySelector('#rays').scrollIntoView()")
    wait_for("!!document.querySelector('#ray-live path')")
    uv=evaluate("document.querySelector('[data-ray-spacetime]').dataset.tokenUv")
    first=evaluate("document.querySelector('#ray-live').innerHTML");time.sleep(1)
    assert uv!=evaluate("document.querySelector('[data-ray-spacetime]').dataset.tokenUv")
    assert first!=evaluate("document.querySelector('#ray-live').innerHTML")
    screenshot('desktop-rays-3d.png')
    evaluate("document.querySelector('.ray-motion-toggle').click()")
    first=evaluate("document.querySelector('#ray-live').innerHTML");time.sleep(.3)
    assert first==evaluate("document.querySelector('#ray-live').innerHTML")
    evaluate("document.querySelector('.ray-motion-toggle').click()")
    assert evaluate("document.querySelectorAll('img[data-animation]').length")==4
    for i in range(2):
        evaluate(f"document.querySelectorAll('[data-geometry-demo]')[{i}].scrollIntoView({{block:'center'}})")
        wait_for(f"Array.from(document.querySelectorAll('[data-geometry-demo]')[{i}].querySelectorAll('img')).every(im=>im.src.includes('.gif') && im.complete && im.naturalWidth===840)")
        screenshot(f'geometry-continuous-{i}.png')
    call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
    evaluate("document.querySelector('#rays').scrollIntoView()")
    time.sleep(.4);assert evaluate("document.documentElement.scrollWidth<=innerWidth")
    screenshot('mobile-rays-3d.png')
    call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1100,'deviceScaleFactor':1,'mobile':False})
    evaluate("document.querySelector('#rays').scrollIntoView()")
    print('PASS: 3D ray motion, pause/resume, four default animated GIFs, mobile width.')
    ws.close();raise SystemExit

call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1100,'deviceScaleFactor':1,'mobile':False})
call('Page.reload',{'ignoreCache':True})
time.sleep(2)
evaluate("document.documentElement.style.scrollBehavior='auto'")
order=evaluate("Array.from(document.querySelectorAll('[data-dataset]')).map(b=>b.dataset.dataset)")
assert order==['waymo','av2','nuscenes'],order
assert evaluate("document.querySelector('[data-result-panel]:not([hidden])').dataset.resultPanel")=='waymo'
assert evaluate("Array.from(document.querySelectorAll('[data-showcase-more]')).every(d=>!d.open)")
assert evaluate("document.querySelectorAll('#history > .real2sim-gallery video').length")==1
assert evaluate("document.querySelectorAll('#history details video').length")==3
assert evaluate("Array.from(document.querySelectorAll('#history video source')).every(s=>s.src.includes('/real2sim/hist-'))")
report={'order':order,'datasets':{},'more_demos':{}}
for ds in order:
    evaluate(f"document.querySelector('[data-dataset={ds}]').click()")
    report['datasets'][ds]=check_group(f'#demo-{ds} > [data-sync-group]')
    assert evaluate("Array.from(document.querySelectorAll('[data-result-panel][hidden] video')).every(v=>v.paused)")
    screenshot(f'desktop-{ds}.png')
    evaluate(f"document.querySelector('#demo-{ds} details summary').click()")
    groups=evaluate(f"document.querySelectorAll('#demo-{ds} details [data-sync-group]').length")
    assert groups==3,groups
    report['more_demos'][ds]=[]
    for i in range(groups):
        selector=f'#demo-{ds} details [data-sync-group]:nth-of-type({i+1})'
        report['more_demos'][ds].append(check_group(selector))
        screenshot(f'desktop-{ds}-more-{i+1}.png')
    evaluate(f"document.querySelector('#demo-{ds} details summary').click()")
    wait_for(f"Array.from(document.querySelectorAll('#demo-{ds} details video')).every(v=>v.paused)")
assert evaluate("Array.from(document.querySelectorAll('[data-driving-demo] video')).every(v=>v.querySelector('source').src.includes('-overlay.mp4'))")

evaluate("document.querySelector('#history').scrollIntoView()")
wait_for("document.querySelector('#history > .real2sim-gallery video').readyState>=3")
screenshot('desktop-real2sim-collapsed.png')
assert evaluate("Array.from(document.querySelectorAll('#history details video')).every(v=>v.paused)")
evaluate("document.querySelector('#history details summary').click()")
report['real2sim']=[]
for i in range(4):
    selector=f'#history video'
    evaluate(f"document.querySelectorAll('{selector}')[{i}].scrollIntoView({{block:'center'}})")
    wait_for(f"(()=>{{const v=document.querySelectorAll('{selector}')[{i}];return v.readyState>=3 && !v.paused && !v.error;}})()")
    state=videos_state(selector)[i]
    assert state['width']==1600 and state['height']==768,state
    report['real2sim'].append(state)
    screenshot(f'desktop-real2sim-{i+1}.png')
evaluate("document.querySelector('#history details summary').click()")
wait_for("Array.from(document.querySelectorAll('#history details video')).every(v=>v.paused)")

call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
evaluate("document.querySelector('[data-dataset=waymo]').click();document.querySelector('#nuscenes').scrollIntoView()")
time.sleep(.4)
report['mobile']=evaluate("({viewport:innerWidth,width:document.documentElement.scrollWidth,grid:getComputedStyle(document.querySelector('.driving-gallery')).gridTemplateColumns})")
assert report['mobile']['width']<=report['mobile']['viewport'],report['mobile']
screenshot('mobile-results.png')
evaluate("document.querySelector('#history').scrollIntoView()")
time.sleep(.4);screenshot('mobile-real2sim-collapsed.png')
evaluate("document.querySelector('#history details summary').click()")
assert evaluate("document.documentElement.scrollWidth<=innerWidth")
evaluate("document.querySelector('#history details summary').click()")
call('Emulation.setEmulatedMedia',{'features':[{'name':'prefers-reduced-motion','value':'reduce'}]})
time.sleep(.3)
assert evaluate("Array.from(document.querySelectorAll('[data-showcase-video]')).every(v=>v.paused)")
call('Emulation.setEmulatedMedia',{'features':[]})
call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1100,'deviceScaleFactor':1,'mobile':False})
evaluate("document.querySelector('#nuscenes').scrollIntoView()")
(OUT/'browser_validation.json').write_text(json.dumps(report,indent=2))
print('PASS: Waymo / AV2 / nuScenes order; 3 extra scenes per dataset; 1+3 Real2Sim; playback, sync, collapse pause, mobile and reduced motion.')
ws.close()
