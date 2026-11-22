---
layout: barron
title: "Point Cloud Clustering for Obstacle Segmentation"
permalink: /blog/point-cloud-clustering/
hide_page_header: true
---

<article class="barron-article" markdown="1">

# Point Cloud Clustering for Obstacle Segmentation

Zhijian Qiao

<div class="barron-article-actions">
  <a class="blog-card-link" href="https://zhuanlan.zhihu.com/p/497930938" lang="zh-CN">中文版（知乎）</a>
  <a class="blog-card-link" href="{{ '/blog/' | relative_url }}">All posts</a>
</div>

*This is an English translation of my [Chinese article on Zhihu](https://zhuanlan.zhihu.com/p/497930938).*

## Problem

Given a single LiDAR point cloud, identify every object in the scene and return its points and an ID.

## Some open-source approaches

### 1. K-means based on Euclidean distance

1. Choose initial samples as cluster centers.
2. For each sample, calculate its distance to each center and assign it to the closest cluster.
3. Recompute each center as the centroid of the samples assigned to that cluster.
4. Repeat steps 2 and 3 until a stopping condition is met, such as an iteration limit or a minimum change in error.

Code: PCL's K-means clustering functions.

### 2. 2D range images

<figure>
  <img src="{{ '/docs/assets/zhihu-497930938/01.webp' | relative_url }}" alt="Range-image-based point cloud segmentation" style="max-width:100%;height:auto">
  <figcaption>Source: <a href="https://www.ipb.uni-bonn.de/wp-content/papercite-data/pdf/bogoslavskyi16iros.pdf">original article</a>.</figcaption>
</figure>

The approach projects the point cloud onto a range image and calculates the angles between points in adjacent rows. The original notes describe using those angles to judge whether a region is traversable.

Papers:

- [Efficient Online Segmentation for Sparse 3D Laser Scans](https://www.researchgate.net/publication/320893417_Efficient_Online_Segmentation_for_Sparse_3D_Laser_Scans)
- [Fast Range Image-Based Segmentation of Sparse 3D Laser Scans for Online Operation](https://www.ipb.uni-bonn.de/wp-content/papercite-data/pdf/bogoslavskyi16iros.pdf)

Code: [depth_clustering](https://github.com/PRBonn/depth_clustering).

### 3. Scan-line methods

<figure>
  <img src="{{ '/docs/assets/zhihu-497930938/02.webp' | relative_url }}" alt="Scan-line segmentation illustration" style="max-width:100%;height:auto">
  <figcaption>Source: <a href="https://zhuanlan.zhihu.com/p/497930938">original article</a>.</figcaption>
</figure>

Cluster points layer by layer, starting from the outermost points and working inward.

Paper: [Fast Segmentation of 3D Point Clouds: A Paradigm on LiDAR Data for Autonomous Vehicle Applications](https://ieeexplore.ieee.org/abstract/document/7989591).

Code: [plane_fit_ground_filter](https://github.com/HuangCongQing/plane_fit_ground_filter).

### 4. Supervoxel-based clustering

Supervoxels are small regions made up of points with similar features. They are used as a preprocessing step for point-cloud segmentation. Supervoxel segmentation does not cross object boundaries, avoiding over-segmentation of the point cloud. The main steps are voxelization, construction of voxel adjacency relationships, grid-based filtering, selection of seed voxels, feature and distance measurement using FPFH, and flow-constrained supervoxel clustering.

<figure>
  <img src="{{ '/docs/assets/zhihu-497930938/03.webp' | relative_url }}" alt="Supervoxel clustering illustration" style="max-width:100%;height:auto">
  <figcaption>Source: <a href="https://openaccess.thecvf.com/content_cvpr_2013/html/Papon_Voxel_Cloud_Connectivity_2013_CVPR_paper.html">original article</a>.</figcaption>
</figure>

Paper: [Voxel Cloud Connectivity Segmentation: Supervoxels for Point Clouds](https://openaccess.thecvf.com/content_cvpr_2013/html/Papon_Voxel_Cloud_Connectivity_2013_CVPR_paper.html).

Code:

1. PCL's supervoxel clustering functions.
2. [ICCVW21 traditional point-cloud clustering survey](https://github.com/placeforyiming/ICCVW21-LiDAR-Panoptic-Segmentation-TradiCV-Survey-of-Point-Cloud-Cluster).
3. [Supervoxel-for-3D-point-clouds](https://github.com/yblin/Supervoxel-for-3D-point-clouds).

### 5. Curved-voxel clustering

<figure>
  <img src="{{ '/docs/assets/zhihu-497930938/04.webp' | relative_url }}" alt="Curved-voxel clustering illustration" style="max-width:100%;height:auto">
  <figcaption>Source: <a href="https://ieeexplore.ieee.org/abstract/document/8968026">original article</a>.</figcaption>
</figure>

First, convert point coordinates from Cartesian to spherical coordinates and assign each point to a “curved voxel,” a voxel in the spherical coordinate system. Use a hash table to associate each voxel index with its points. During clustering, use the hash table for lookup and traverse the voxels in a way similar to BFS. The reported speed is 20 Hz on an i7-8700.

Paper: [Curved-Voxel Clustering for Accurate Segmentation of 3D LiDAR Point Clouds with Real-Time Performance](https://ieeexplore.ieee.org/abstract/document/8968026).

Code: [Lidar-Segementation](https://github.com/wangx1996/Lidar-Segementation).

Related article: [基于曲率的体素聚类的三维激光雷达点云实时鲁棒分割方法](https://mp.weixin.qq.com/s?__biz=MzI0MDYxMDk0Ng==&mid=2247493251&idx=1&sn=1431023771f19d0633b3ea8481e01b7f).

### 6. GPU-accelerated density-based clustering

<figure>
  <img src="{{ '/docs/assets/zhihu-497930938/05.webp' | relative_url }}" alt="GPU density-based clustering illustration" style="max-width:100%;height:auto">
  <figcaption>Source: <a href="https://www.sciencedirect.com/science/article/pii/S1877050913003438">original article</a>.</figcaption>
</figure>

Paper: [G-DBSCAN: A GPU Accelerated Algorithm for Density-based Clustering](https://www.sciencedirect.com/science/article/pii/S1877050913003438).

Code: [Robotics with GPU computing](https://github.com/pangfumin/cupoch).

## References

1. [3D point-cloud segmentation paper summary](https://blog.csdn.net/weixin_43211438/article/details/89357039).
2. [A technical summary and evaluation of traditional point-cloud clustering methods for LiDAR panoptic segmentation](https://mp.weixin.qq.com/s/a2ad4HJPwholo3Ek9RIyeg).
3. [ICCV 2021 traditional point-cloud clustering survey](https://openaccess.thecvf.com/content/ICCV2021W/TradiCV/papers/Zhao_A_Technical_Survey_and_Evaluation_of_Traditional_Point_Cloud_Clustering_ICCVW_2021_paper.pdf), with [code](https://github.com/placeforyiming/ICCVW21-LiDAR-PanopticSegmentation-TradiCV-Survey-of-Point-Cloud-Cluster).

</article>
