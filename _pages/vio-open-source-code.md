---
layout: barron
title: "A Guide to Open-Source VIO Code"
permalink: /blog/vio-open-source-code/
hide_page_header: true
---
<article class="barron-article" markdown="1">
# A Guide to Open-Source VIO Code

Zhijian Qiao

<div class="barron-article-actions">
  <a class="blog-card-link" href="https://zhuanlan.zhihu.com/p/497942945" lang="zh-CN">中文版（知乎）</a>
  <a class="blog-card-link" href="{{ '/blog/' | relative_url }}">All posts</a>
</div>

*This is an English translation of my Chinese article. The list reflects the projects and my impressions when I wrote it in 2022; project status and rankings may have changed.*

## Introduction

Learning the classic SLAM systems is essential for a graduate student in the field. Improving them, however, can be hard when you are just starting out. Ideas rarely come from nowhere. One way to start is to look up papers that cite a classic paper on Google Scholar and see how others have changed the system. But for a beginner, reading the papers is hard enough, let alone reproducing them.

I put together this survey of open-source VIO code to make it easier to build on existing work, use it in a project, or develop an idea into a paper. The categories roughly follow each paper's main contribution; they are not intended as a strict taxonomy.

## Initialization

- [VINS-Mono-QPEP (TRO 2022)](https://github.com/zarathustr/VINS-Mono-QPEP) formulates initialization PnP as a Quadratic Pose Estimation Problem (QPEP), addressing the possibility that the PnP algorithm in the earlier VINS-Mono initialization SfM pipeline does not find a global optimum.

## Front end

- [rpg_svo_pro_open](https://github.com/uzh-rpg/rpg_svo_pro_open): semi-direct visual-inertial odometry.
- [Anticipated-VINS-Mono (ICRA 2017)](https://github.com/plusk01/Anticipated-VINS-Mono): reduces feature-track loss by selecting features for optimization more carefully.
- [CNN_VINS](https://github.com/GuoFeng-X/CNN_VINS): replaces VINS optical-flow tracking with SuperPoint feature extraction.
- [orbvins_fusion](https://github.com/Wilhelm-Marais/orbvins_fusion): adds ORB features to VINS.
- [VINS-YOLO](https://github.com/bledem/bb_vins): combines object detection with VINS-Mono to improve detection when a robot accelerates.

## Line features

- [PL-VINS](https://github.com/cnqiangfu/PL-VINS): adds line features and, at the same operating speed and low power consumption, can produce higher accuracy than VINS-Mono.
- [VINS-Mono-Optimization](https://github.com/Jichao-Peng/VINS-Mono-Optimization): adds line features to VINS-Mono and tightly optimizes points and lines together. See the accompanying [blog post](https://blog.csdn.net/weixin_44580210/article/details/98661696) for details.

## Additional sensors

- [VINS-Fisheye](https://github.com/xuhao1/VINS-Fisheye): a fisheye version of VINS-Fusion for stereo cameras with a very wide field of view, accelerated with GPU and VisionWorks. It runs in real time on an NVIDIA TX2 using additional acceleration strategies, which are described in a related Zhihu post, and can also estimate depth from fisheye images. This came from my former lab.
- [VIW-Fusion](https://github.com/TouchDeeper/VIW-Fusion): a feature-rich VINS variant with wheel odometry. In April 2022, I considered it the best option in this category.
- [GVINS (TRO 2022)](https://github.com/HKUST-Aerial-Robotics/GVINS): tightly fuses raw GNSS measurements with visual and inertial information for real-time, drift-free state estimation. This also came from my former lab.
- [VINS-RGBD (Sensors 2019)](https://github.com/STAR-Center/VINS-RGBD.git): supports localization with monocular, stereo, or RGB-D cameras and an IMU. With RGB-D, it can build dense octree maps; it also supports importing grid maps.
- [R2DIO (RA-L 2021)](https://github.com/jiejie567/R2DIO): RGB-D-inertial SLAM.
- [IC-GVINS (RA-L 2022)](https://github.com/i2Nav-WHU/IC-GVINS): a VINS system that fuses wheel odometry, IMU, GNSS, and vision.
- [VINS-RGBD-FAST (RA-L 2022)](https://github.com/jianhengLiu/VINS-RGBD-FAST): VINS-RGBD odometry for dynamic environments and resource-constrained devices such as the AGX.

## Back end

- [vins_so](https://github.com/gaowenliang/vins_so): an early version of VINS-Fusion.
- [DynaVINS (RA-L 2022)](https://github.com/url-kaist/dynaVINS): VINS-Fusion for dynamic environments.
- [VID-Fusion (ICRA 2021)](https://github.com/ZJU-FAST-Lab/VID-Fusion): uses a tightly coupled visual-inertial-dynamics estimator to jointly estimate multirotor odometry and external forces. This is work from Prof. Fei Gao's group.
- [VINS-Fusion with Cerebro (RAS 2021)](https://github.com/mpkuse/cerebro): a loop-detection method from my former lab.
- [Basalt (RA-L 2019)](https://gitlab.com/VladyslavUsenko/basalt): work from TUM using nonlinear factor recovery in the back end. It is not derived from VINS, but its improvements could be ported to VINS.
- [DM-VIO (RA-L 2022)](https://github.com/lukasvst/dm-vio): delayed-marginalization odometry from TUM. It is not derived from VINS either, but its ideas could also be ported.
- [ROSEFusion (SIGGRAPH 2021)](https://github.com/jzhzhang/ROSEFusion): depth-image and IMU odometry that handles fast motion; it uses stochastic optimization to deal with large inter-frame pose changes.
- [spline_vio (ICRA 2022)](https://github.com/IRVLab/spline_vio): continuous-time VIO based on DSO.

## Filter-based methods

- [OpenVINS (ICRA)](https://github.com/rpng/open_vins): an MSCKF-based VIO library that was actively maintained when I wrote this list.
- [envio (TRO 2022)](https://github.com/lastflowers/envio): iterated extended Kalman filter VIO with photometric error and stochastic linearization.
- [EqVIO](https://github.com/pvangoor/eqvio): VIO based on an equivariant filter on Lie groups, designed to improve consistency.

## Multi-robot systems

- [Omni-swarm](https://github.com/HKUST-Aerial-Robotics/Omni-swarm): distributed omnidirectional visual-inertial-UWB state estimation, from my former lab.
- [Kimera (IJRR 2021)](https://github.com/MIT-SPARK/Kimera): MIT's C++ library for real-time metric-semantic localization and mapping. It uses camera images and inertial data to build a semantically annotated 3D mesh of the environment.
- [vins_client_server](https://github.com/VIS4ROB-lab/vins_client_server): builds on the original VINS-Mono and adds the ability to fuse sensor data from multiple robots and send it back to a server.

## Code organization and teaching

- [VINS-Course](https://github.com/HeYijia/VINS-Course): code for a DeepBlue Academy course that builds VIO from scratch.
- [vins-mono-self-improved](https://github.com/iwander-all/vins-mono-self-improved-.git): reorganizes and wraps the code to improve readability.
- [VINS-simplified](https://github.com/Zhi29/VINS-simplified): mostly based on VINS-Mono, with a simplified back end implemented in Eigen.
- [My_VINS](https://github.com/chengKID/My_VINS): based on VINS-Mono but does not use ROS, Ceres, or G2O. Its Eigen back end implements Levenberg–Marquardt, a sliding window, and robust kernels.

## Other platforms

- [Android-VINS](https://github.com/heguixiang/Android-VINS): VINS-Mono running on Android.
- [VINS-Fusion-gpu](https://github.com/pjrambo/VINS-Fusion-gpu): a GPU-accelerated VINS-Fusion version that runs in real time on an NVIDIA TX2.
- [ros2-VINS-Fusion](https://github.com/LiZheng1997/ros2-VINS-Fusion): a ROS 2 version of VINS-Fusion.
- [VINS-Mono-Windows](https://github.com/castiel520/VINS-Mono-Windows): a Windows, non-ROS version of VINS-Mono.
- [Purple River's articles](https://www.zhihu.com/people/ceng-yu-57-53/posts): practical experience deploying VINS.

</article>
