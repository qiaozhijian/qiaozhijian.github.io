# Homepage preview revision

Local preview: http://localhost:4010/merope/. Review scripts are tracked in Git; running them does not deploy the site.

审阅媒体、候选集和验证输出位于已被 `.gitignore` 排除的
`build/merope-review-20260923/site_review/`；这里仅保留可维护脚本和说明。

Driving examples use multisource v2 baseline checkpoint-20000, the held-out geostress10 protocol and seed 42. In Waymo, AV2, nuScenes order, each dataset has a default scene and three expandable scenes, each with left, original and right commands. All 49 frames are retained. Yellow denotes the commanded path; cyan denotes the recovered camera path. The small BEV also shows the original path in blue. The projection uses the earlier fixed world-down correction. BEV width is capped at 25% of the native frame width.

Selected scene ranks: Waymo 1 / 5 / 2 / 3; AV2 1 / 2 / 3 / 8; nuScenes 12 / 2 / 3 / 4. The first scene in each list is featured. The added scenes were inspected across all 49 frames, with sheets named `extra_*.jpg` and `expanded_*.jpg`. These are qualitative selections, not evidence of performance over the full evaluation set.

Real2Sim scenes 2, 4, 5 and 6 were rendered on a white canvas with light gray rounded panels. The layout is three panels above four reference views. Only scene 2 is shown by default; scenes 4, 5 and 6 are in the More demos disclosure. Eight additional candidates were examined in `history_search`; search ranks 6 and 7 became scene 5 (broad city crossing) and scene 6 (tree-lined junction). Both new scenes were reviewed across all 49 frames. Numbered camera positions correspond to the reference images. The model uses four scan references and nine conditioning frames. Scene 3 was reviewed but excluded because the right-path video deforms parked vehicles near the end. Rendering files for that rejected candidate remain outside the homepage.

Regeneration:

```sh
/home/dji/miniconda3/envs/vipe/bin/python tools/merope-review/render_overlays.py
MPLCONFIGDIR=/tmp/merope-mpl python ../merope-paper/scripts/supplementary/demo_review/render_real2sim.py 2 4 5 6
```

The overlay renderer uses the previously copied local raw videos. Calibrated intrinsics and camera heights come from the evaluation geometry sidecar. The site manifest `_data/merope_demo_assets.json` records sources and hashes.

Verification: Jekyll build, JavaScript syntax, local asset references, complete video decoding and frame counts. `check_browser.py` checks the isolated local Chrome preview: dataset switching, default overlay sources, expanded-demo playback and synchronization, pause on collapse, four white Real2Sim videos, reduced motion and mobile page width. Screenshots are saved alongside the script.

Local raw media and candidate renders are ignored. [local-media.json](local-media.json) records their paths, sizes, SHA-256 hashes, and provenance references. These local files must be supplied separately to reproduce the review. The existing selected-site-media manifest and already tracked publication assets remain versioned.
