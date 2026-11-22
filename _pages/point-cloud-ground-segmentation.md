---
layout: barron
title: "Ground Segmentation from Point Clouds"
permalink: /blog/point-cloud-ground-segmentation/
hide_page_header: true
---
<article class="barron-article" markdown="1">
# Ground Segmentation from Point Clouds

Zhijian Qiao

<div class="barron-article-actions">
  <a class="blog-card-link" href="https://zhuanlan.zhihu.com/p/497893572" lang="zh-CN">中文版（知乎）</a>
  <a class="blog-card-link" href="{{ '/blog/' | relative_url }}">All posts</a>
</div>

*This is an English translation of my Chinese article.*

## The problem

**Input:** a single LiDAR point cloud.<br>
**Output:** the points belonging to the ground or traversable region.

Search terms include “ground segmentation” and “traversable region segmentation.” The [Ground-Segmentation-Benchmark](https://github.com/url-kaist/Ground-Segmentation-Benchmark) uses KITTI data to compare methods.

## Related work

### Hand-designed models

- [A Fast Point Cloud Road Segmentation Approach Based on Coarse-To-Fine Markov Random Field](https://arxiv.org/pdf/2011.13140.pdf)
- [On the segmentation of 3d lidar point clouds](https://asset-pdf.scinapse.io/prod/2132360065/2132360065.pdf)
- [Segmentation of 3D lidar data in non-flat urban environments using a local convexity criterion](https://ieeexplore.ieee.org/abstract/document/5164280/)
- [Ground estimation and point cloud segmentation using SpatioTemporal Conditional Random Field](https://ieeexplore.ieee.org/abstract/document/7995861)
- [Fast segmentation of 3D point clouds: A paradigm on LiDAR data for autonomous vehicle applications](https://ieeexplore.ieee.org/document/7989591)
- [Fast segmentation of 3d point clouds for ground vehicles](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=5548059&tag=1)
- [Patchwork: Concentric Zone-Based Region-Wise Ground Segmentation With Ground Likelihood Estimation Using a 3D LiDAR Sensor](https://ieeexplore.ieee.org/abstract/document/9466396)
- [Efficient Online Segmentation for Sparse 3D Laser Scans](https://www.researchgate.net/publication/320893417_Efficient_Online_Segmentation_for_Sparse_3D_Laser_Scans)
- [Patchwork++: Fast and Robust Ground Segmentation Solving Partial Under-Segmentation Using 3D Point Cloud (IROS2022)](https://arxiv.org/abs/2207.11919)
- [TRAVEL: Traversable Ground and Above-Ground Object Segmentation Using Graph Representation of 3D LiDAR Scans (RAL2022)](https://ieeexplore.ieee.org/abstract/document/9794594)

### Data-driven methods

- [Cylindrical and asymmetrical 3d convolution networks for lidar segmentation](https://openaccess.thecvf.com/content/CVPR2021/papers/Zhu_Cylindrical_and_Asymmetrical_3D_Convolution_Networks_for_LiDAR_Segmentation_CVPR_2021_paper.pdf)
- [Squeezesegv2: Improved model structure and unsupervised domain adaptation for road-object segmentation from a lidar point cloud](https://arxiv.org/pdf/1809.08495.pdf?ref=https://githubhelp.com)
- [RandLA-Net: Efficient Semantic Segmentation of Large-Scale Point Clouds](https://openaccess.thecvf.com/content_CVPR_2020/papers/Hu_RandLA-Net_Efficient_Semantic_Segmentation_of_Large-Scale_Point_Clouds_CVPR_2020_paper.pdf)
- [Gndnet: Fast ground plane estimation and point cloud segmentation for autonomous vehicles](https://hal.inria.fr/hal-02927350/document)
- [GSECnet: Ground Segmentation of Point Clouds for Edge Computing](https://arxiv.org/pdf/2104.01766.pdf)

## Selected open-source methods

### 1. Plane fitting

First compute the covariance matrix of the points to which a plane will be fitted. Apply singular value decomposition to the covariance matrix: the singular vector associated with the smallest singular value is the plane normal. The plane offset can be obtained from the plane normal and the mean of the points.

Paper: [Fast Segmentation of 3D Point Clouds: A Paradigm on LiDAR Data for Autonomous Vehicle Applications](https://ieeexplore.ieee.org/document/7989591).<br>
Code: [plane_fit_ground_filter](https://github.com/HuangCongQing/plane_fit_ground_filter).

### 2. Local point-cloud slope

1. Compute the slope between points on adjacent laser beams.
2. Smooth slopes in a local region with a Savitzky–Golay filter.
3. Traverse the point cloud using breadth-first search. With a suitable threshold, the method can extract uneven traversable ground.

<p><img src="{{ '/docs/assets/blog/ground-segmentation/1.webp' | relative_url }}" alt="Local slope illustration" style="max-width:60%;height:auto" /></p>

Figure reproduced from the [Chinese article](https://zhuanlan.zhihu.com/p/497893572); related method: [Efficient Online Segmentation for Sparse 3D Laser Scans](https://www.researchgate.net/publication/320893417_Efficient_Online_Segmentation_for_Sparse_3D_Laser_Scans).<br>
Code: [depth_clustering](https://github.com/PRBonn/depth_clustering).

### 3. Line fitting in angular sectors

Transform each point from XYZ coordinates to its azimuth, distance in the XY plane, and height. This projects the cloud into angular sectors. In each sector, take the lowest points along the Z axis and fit lines to extract traversable ground. This method can handle slopes.

<p><img src="{{ '/docs/assets/blog/ground-segmentation/2.webp' | relative_url }}" alt="Line fitting in point-cloud sectors" style="max-width:60%;height:auto" /></p>

Figure reproduced from the [Chinese article](https://zhuanlan.zhihu.com/p/497893572); related paper: [Fast Segmentation of 3D Point Clouds for Ground Vehicles](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=5548059&tag=1).<br>
Code: [linefit_ground_segmentation](https://github.com/lorenwel/linefit_ground_segmentation).

### 4. Region-wise ground segmentation

Patchwork chooses region-partitioning parameters experimentally and divides the space into regions as shown below. It then uses a function of the fitted ground plane's uprightness, mean point height, and point-cloud flatness in each bin to decide whether the bin is ground.

<p><img src="{{ '/docs/assets/blog/ground-segmentation/3.webp' | relative_url }}" alt="Concentric regions used for ground segmentation" style="max-width:60%;height:auto" /></p>

Figure reproduced from the [Chinese article](https://zhuanlan.zhihu.com/p/497893572); paper: [Patchwork: Concentric Zone-Based Region-Wise Ground Segmentation With Ground Likelihood Estimation Using a 3D LiDAR Sensor](https://ieeexplore.ieee.org/abstract/document/9466396).<br>
Code: [patchwork](https://github.com/LimHyungTae/patchwork).

</article>
