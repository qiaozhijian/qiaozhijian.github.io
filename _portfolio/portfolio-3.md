---
title: "Autonomous Driving for Tracked Robot in Off-road Environment"
excerpt: "In an off-road environment, the assumption of horizontal ground is usually invalid, so IMU and wheel encoders are integrated into a closed form on SE3, which can be used to correct the distortion caused by motion. In addition, [LPD-Net](https://github.com/qiaozhijian/LPD-Net-Pytorch.git) (reproduced by myself) is integrated into [LIO-SAM](https://github.com/TixiaoShan/LIO-SAM.git) to detect loop-closure with a coarse-to-fine sequence matching strategy, which helps to build a more accurate map for map-based localization. Then [PLReg3D](https://github.com/IRMVLab/PLReg3D.git) learns local and global descriptors jointly for global localization at the initial step. Finally, a loosely-coupled method based on the pose graph is applied to provide the robot with a robust and accurate pose.
<br/>
<img src='/media/images/localize.gif' width='500'>"
collection: portfolio
---

In an off-road environment, the assumption of horizontal ground is usually invalid, so IMU and wheel encoders are integrated into a closed form on SE3, which can be used to correct the distortion caused by motion. In addition, [LPD-Net](https://github.com/qiaozhijian/LPD-Net-Pytorch.git) (reproduced by myself) is integrated into [LIO-SAM](https://github.com/TixiaoShan/LIO-SAM.git) to detect loop-closure with a coarse-to-fine sequence matching strategy, which helps to build a more accurate map for map-based localization. Then [PLReg3D](https://github.com/IRMVLab/PLReg3D.git) learns local and global descriptors jointly for global localization at the initial step. Finally, a loosely-coupled method based on the pose graph is applied to provide the robot with a robust and accurate pose.
<br/>
<div align=center><img src='/media/images/robot.png' width='300'></div>

### Global Localization
The global localization framework is shown in Figure 1. For a query point cloud (yellow), we use KNN to find the most similar point cloud (blue) based on the global descriptor of the point cloud and exclude those that are not similar (grey). This gets a coarse pose in the global coordinate system. Then, based on the local descriptors, we register the query point cloud (yellow) and its most similar point cloud (blue) to obtain an accurate pose.

<div align=center>
<img src='/media/images/pipline.png' >
<br>
<div style="color:orange; border-bottom: 1px solid #d9d9d9;display: inline-block;color: #999;padding: 2px;">
Figure 1
</div>
</div>

We show the global localization based on a built map(gray) in Figure 2. Given the query point cloud (yellow), based on the KNN on global
descriptors, we find the most similar submap (blue) to query. The robot has different positions and poses when collecting these two point
cloud frames, which are marked by the coordinate axes shown in the figure. With red, green, and blue axis corresponding to X, Y and
Z axis, respectively, the coordinate system on the left refers to the submap, while the right refers to the query. Through KNN on the local
descriptors and outlier removing methods such as RANSAC, we can expose the correspondence between two point clouds to compute their relative pose transformation.

<div align=center>
<img src='/media/images/registration.jpg' >
<br>
<div style="color:orange; border-bottom: 1px solid #d9d9d9;display: inline-block;color: #999;padding: 2px;">
Figure 2
</div>
</div>

### Demo
<div align=center>
<img src='/media/images/localize.gif' width='500'>
<br>
<div style="color:orange; border-bottom: 1px solid #d9d9d9;display: inline-block;color: #999;padding: 2px;">
Localization is based on a built map.
</div>
</div>
