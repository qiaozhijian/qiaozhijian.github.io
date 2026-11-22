---
layout: barron
title: "KITTI Odometry Ground Truth in the LiDAR Frame"
permalink: /blog/kitti-lidar-odometry-ground-truth/
hide_page_header: true
mathjax: true
---

<article class="barron-article" markdown="1">

# KITTI Odometry Ground Truth in the LiDAR Frame

Zhijian Qiao

<div class="barron-article-actions">
  <a class="blog-card-link" href="https://zhuanlan.zhihu.com/p/128006350" lang="zh-CN">中文版（知乎）</a>
  <a class="blog-card-link" href="{{ '/blog/' | relative_url }}">All posts</a>
</div>

*This is an English translation of my [Chinese article on Zhihu](https://zhuanlan.zhihu.com/p/128006350).*

The KITTI odometry devkit's `devkit_odometry\devkit\readme.txt` says that the supplied odometry ground truth is expressed in the left camera frame. It does not provide ground truth in the LiDAR frame. Converting it is useful when working with KITTI point clouds.

<figure>
  <img src="{{ '/docs/assets/zhihu-128006350/01.webp' | relative_url }}" alt="KITTI odometry devkit readme download location" style="max-width:100%;height:auto">
  <figcaption>Source: <a href="https://zhuanlan.zhihu.com/p/128006350">original article</a>.</figcaption>
</figure>

The readme gives the transformation from a point in the LiDAR frame to image coordinates:

$$
x = P_i \operatorname{Tr} x.
$$

Here $P_i$ is the projection matrix, and $\operatorname{Tr}$ transforms a point from the LiDAR frame to the camera frame. From `calib.txt`, the example transformation is:

$$
\operatorname{Tr} = \begin{bmatrix}
4.276802385584\mathrm{e}{-04} & -9.999672484946\mathrm{e}{-01} & -8.084491683471\mathrm{e}{-03} & -1.198459927713\mathrm{e}{-02} \\
-7.210626507497\mathrm{e}{-03} & 8.081198471645\mathrm{e}{-03} & -9.999413164504\mathrm{e}{-01} & -5.403984729748\mathrm{e}{-02} \\
9.999738645903\mathrm{e}{-01} & 4.859485810390\mathrm{e}{-04} & -7.206933692422\mathrm{e}{-03} & -2.921968648686\mathrm{e}{-01} \\
0 & 0 & 0 & 1
\end{bmatrix}.
$$

Take two points $\bar{p}_1$ and $\bar{p}_2$ in the LiDAR frame, with corresponding camera-frame coordinates $p_1$ and $p_2$:

$$
p_1 = \operatorname{Tr}\bar{p}_1 \tag{1}
$$

$$
p_2 = \operatorname{Tr}\bar{p}_2. \tag{2}
$$

Let $R_2^1$ be the pose transformation between the points in the camera frame, and $\bar{R}_2^1$ the corresponding transformation in the LiDAR frame:

$$
p_1 = R_2^1 p_2 \tag{3}
$$

$$
\bar{p}_1 = \bar{R}_2^1\bar{p}_2. \tag{4}
$$

Substituting equations (1) and (2) into equation (3) gives:

$$
\operatorname{Tr}\bar{p}_1 = R_2^1\operatorname{Tr}\bar{p}_2. \tag{5}
$$

Thus:

$$
\bar{p}_1 = \operatorname{Tr}^{-1} R_2^1 \operatorname{Tr}\bar{p}_2. \tag{6}
$$

Comparing equations (4) and (6), we get:

$$
\bar{R}_2^1 = \operatorname{Tr}^{-1} R_2^1 \operatorname{Tr}. \tag{7}
$$

Equation (7) converts a pose transformation, or odometry, from the camera frame to the LiDAR frame.

You might ask whether changing the coordinates of a point, such as the vehicle, only requires multiplying by a transformation matrix. It does for a point. But the vehicle is not a point: visual odometry and LiDAR odometry have different origins.

</article>
