---
title: "Tightly-coupled Visual-Inertial-Wheel Odometry for Ground Robot"
excerpt: "VINS has additional unobservable directions for localizing wheeled robots such as scale when a ground robot is constrained to particular motion. Furthermore, accelerometer measurements on the ground robot are greatly affected by noise compared to those on the aerial robot. For these considerations, Wheel measurements are integrated into VINS, where we reference some excellent open-source codes(such as [VIW-Fusion](https://github.com/TouchDeeper/VIW-Fusion/)) and implement wheel odometer pre-integration, residuals and extrinsic parameters calibration. On the other hand, GPU-accelerated feature extraction and optical flow methods are integrated into the system to accelerate the front end. The optimization in the back end is also improved to detect and remove(or reduce weights) the outliers of IMU and wheel pre-integrations and visual measurements. [Fast-LIO2](https://github.com/hku-mars/FAST_LIO) is also integrated based on a factor graph. Furthermore, the Sparsification for graph optimization is on the to-do list.
<br/>
<br/>
<img src='/media/images/grass-demo.gif' width='500'>
"
collection: portfolio
---

VINS has additional unobservable directions for localizing wheeled robots, such as scale when a ground robot is constrained to a particular motion. Furthermore, accelerometer measurements on the ground robot are greatly affected by noise compared to those on the aerial robot. For these considerations, Wheel measurements are integrated into VINS, where we reference some excellent open-source codes(such as [VIW-Fusion](https://github.com/TouchDeeper/VIW-Fusion/)) and implement wheel odometer pre-integration, residuals, and extrinsic parameters calibration. On the other hand, GPU-accelerated feature extraction and optical flow methods are integrated into the system to accelerate the front end. The optimization in the back end is also improved to detect and remove(or reduce weights) the outliers of IMU and wheel pre-integrations and visual measurements. [Fast-LIO2](https://github.com/hku-mars/FAST_LIO) is also integrated based on a factor graph. Furthermore, the Sparsification for graph optimization is on the to-do list.

VINS on wheel visualization.
 <div align=center >
     <img src="/media/images/viw.gif" width="700"/>
 </div>
 <div align=center >
     <img src="/media/images/grass-demo.gif" width="700"/>
 </div>
 <div align=center >
     <img src="/media/images/grass-shadow.gif" width="700"/>
 </div>
 <br/>
 Fusion with Fast-LIO2 based on a factor graph.
 <div align=center >
     <img src="/media/images/lviw.gif" width="700"/>
 </div>
