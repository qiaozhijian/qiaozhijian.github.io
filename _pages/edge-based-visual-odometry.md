---
layout: barron
title: "Notes on Edge-Based Visual Odometry"
permalink: /blog/edge-based-visual-odometry/
hide_page_header: true
mathjax: true
---
<article class="barron-article" markdown="1">
# Notes on Edge-Based Visual Odometry

Zhijian Qiao

<div class="barron-article-actions">
  <a class="blog-card-link" href="https://zhuanlan.zhihu.com/p/619674700" lang="zh-CN">中文版（知乎）</a>
  <a class="blog-card-link" href="{{ '/blog/' | relative_url }}">All posts</a>
</div>

*This is an English translation of my Chinese article.*

## Introduction

<p><img src="{{ '/docs/assets/blog/edge-based-vo/1.webp' | relative_url }}" alt="Illustration of edge-based visual odometry" style="max-width:60%;height:auto" /></p>

Figure from [Canny-VO](https://arxiv.org/abs/2012.08228), as reproduced in the [Chinese article](https://zhuanlan.zhihu.com/p/619674700).

In 2019, when I had just arrived at SJTU and started learning visual SLAM, my advisor asked me to find a research idea. I spent a week reading *Fourteen Lectures on SLAM* and classic papers such as ORB and VINS (each time I read them again, I feel I understand a little more). I came up with two ideas: add line features and select among the features, or build a VIO system that removes dynamic objects. To be honest, I did not know how to do either, and I could not think of a solid contribution. My advisor rejected both ideas. A week later, another meeting ended the same way.

So I took the liberty of asking him for a suggestion—perhaps even an idea directly. He asked whether curves could be used as features. I immediately objected: adding lines was already troublesome, and points were abundant in practice, so what was the point of curves? He did not find that convincing and asked me to look for related work. After another week or two of back and forth, I finally persuaded him not to pursue Curve-SLAM. He had to accept it, reluctantly. I had not formally enrolled yet and was still working on my undergraduate project, so I had more say over the direction. By then I was tired of reading papers in search of a topic and wanted to write some code. I started on line SLAM, mixed and modified ideas from several feature-selection papers, and wrapped up with results that barely changed whether I selected features or used lines at all.

Four years later, I suddenly realized that curves in SLAM might not be useless after all. Back then, I had searched for “curve VO” and never even found my way to edge-based VO. It is a little embarrassing to start as a PhD student what I should have finished as an undergraduate. Well, I can laugh at myself about it now.

Back to the topic. One line of work in visual odometry is called **edge-based VO**. Why not curve-based? The aim is to use image edges alongside conventional point features to improve VO accuracy and the semantic content of the map. A curve is one way to represent an edge; a collection of points is another. So edge-based VO may be the better name.

Although it sounds like a simple addition to feature-based VO, much of its motivation came from the observation that photometric error in direct methods can get stuck in local optima and is sensitive to lighting [3, 5]. Edge association is generally based on nearest point-to-edge matches rather than local image gradients. In repeated or weakly textured regions, this can give pose estimation a wider convergence basin. A nearest-neighbor approach also avoids extracting and matching descriptors and does not depend on image RGB values, making it more robust to illumination. Edges can help feature-based VO too: adding another feature level improves the signal-to-noise ratio.

## The development of edge-based VO

To add a new feature to a VO system, we first need to consider four questions: how to extract it, how to parameterize and initialize it, how to associate measurements, and how to construct the residual.

### Edge representation and initialization

An edge detector such as Canny can extract edges. Early work generally represented an edge as a collection of points, each consisting of an edge pixel and depth. Others used splines to represent a curve in world coordinates. Canny provides the pixels; depth can come directly from an RGB-D camera or from triangulation.

### Data association

Data association can be understood as a nearest-neighbor search in image space. Using pose $T$—the variable to optimize, with an initial estimate from a constant-velocity model—we transform the edge points and their depths into the current camera frame, project them into the image, and associate them with edges detected in the current frame.

There are two questions here. In SLAM, a feature maintained over time is usually called a landmark (or a *model* in computer vision); a new observation is a *measurement* (or *data*). Should the model look for its nearest data point, or should the data look for its nearest model point [8]? Reference [8] points out the **partial-observation** problem: the model should be more complete, so data should search for the model. If the model searches for data, a corresponding observation may be missing, yet a nearest-neighbor query must still return something. Reference [12] agrees this is an issue, but argues that its loss design can mitigate it to some extent and still searches from model to data. Neither direction is universally right; the choice depends on the application.

The second question is how to find the nearest neighbor and which data structure to use. This matters in LiDAR SLAM too, where work such as iKD-Tree and iVox addresses the search. In 2015–2016, when edge VO was getting started [1–6], researchers used a **distance field** (DF). In the figure below, gray pixels are detected edge data. For a model-to-data search, precompute the distance from every pixel to its nearest data pixel. After projecting a model point into the current image, we can look up that distance directly. If we optimize the pose and project again, we can query the same field. Building the field has a cost, but each subsequent association takes $O(1)$ time. The field does introduce a differentiability problem [5, 7].

<p><img src="{{ '/docs/assets/blog/edge-based-vo/2.webp' | relative_url }}" alt="Distance field for image edges" style="max-width:60%;height:auto" /></p>

Figure from Canny-VO, as reproduced in the [Chinese article](https://zhuanlan.zhihu.com/p/619674700).

### Constructing the residual

Once we have nearest-neighbor pairs, we can form residuals and optimize the pose. Each pair consists of two 2D image points, as in ordinary point-based VO, so we could use their Euclidean distance directly. But an inaccurate pose leads to an inaccurate model projection, and the nearest neighbor may not be the correct match. Curves, like lines, are also hard to match accurately point to point. For a line feature we do not require its endpoints to coincide exactly; instead we ask that a point lie on the line. Similarly, most work uses a **point-to-tangent** residual [1, 7].

<p><img src="{{ '/docs/assets/blog/edge-based-vo/3.webp' | relative_url }}" alt="Point-to-tangent edge alignment" style="max-width:60%;height:auto" /></p>

Figure from Canny-VO, as reproduced in the [Chinese article](https://zhuanlan.zhihu.com/p/619674700).

In the figure, blue is the projected model and red is the data. The green point finds a nearest red point. Instead of using the length of the difference vector, the residual projects that vector onto the normal at the green point. This substantially reduces the effect of inaccurate association. One question remains: should we use the green point's normal or the red point's? Reference [12] finds that they are much the same. Sometimes robotics calls for a little observation of what happens in practice.

The next question is how to differentiate the residual with respect to the optimization variables. The distance field gives us a distance by indexing a table, so that part of the residual is not directly differentiable. One option is to differentiate the table, for example by computing the DF image gradient [3]; another is numerical differentiation [2]. References [7, 12] instead propose a **nearest-neighbor field**: each pixel stores the coordinates of its nearest edge point rather than the distance to it.

<p><img src="{{ '/docs/assets/blog/edge-based-vo/4.webp' | relative_url }}" alt="Nearest-neighbor field" style="max-width:60%;height:auto" /></p>

Figure from Canny-VO, as reproduced in the [Chinese article](https://zhuanlan.zhihu.com/p/619674700).

The distance term is then no longer read directly from a table. We retrieve the nearest edge-point coordinates, subtract the projected model point, and project the difference onto the normal. The resulting calculation is differentiable.

## Closing thoughts

Those are the core techniques and main challenges in edge-based VO. Later work falls roughly into three groups: building a more complete edge SLAM system [13]; faster or better association through multiscale, divide-and-conquer [12], or semantic constraints [15]; and representing 3D curves in world coordinates with splines such as Bézier curves, treating each detected edge as an observation and optimizing the spline [9]. A spline is continuous, unlike a discrete point set, and can be extended.

Edge-based VO has remained a fairly quiet area within visual SLAM. I do not believe the problem is completely solved, but its practical value may be limited, which may explain the small number of researchers working on it. There are several difficulties:

- A point-set representation is discrete and introduces approximation error. Splines, on the other hand, are complex to initialize and optimize.
- An edge may be an apparent contour or the result of occlusion rather than a true curve—for example, the outline of a smooth ceramic object. Such a “false curve” cannot be used for VO.
- Adding lines, planes, or edges to points is a trade-off. Detection and optimization both add computation. Extra constraints may also be wrong because of inaccurate association and can reduce accuracy rather than improve it.

If these problems are solved one day, I believe the results will be useful to SLAM. If you are interested in working on them, I hope this post helps. No need to thank me.

By the way, while surveying the field I gradually realized that quite a few of these papers were by senior students in my group. A little embarrassing, again.

## References

1. *Realtime Edge-Based Visual Odometry for a Monocular Camera*, ICCV 2015.
2. *SDICP: Semi-Dense Tracking based on Iterative Closest Points*, BMVC 2015.
3. *Edge Alignment-Based Visual–Inertial Fusion for Tracking of Aggressive Motions*, Autonomous Robots, 2017.
4. *Distance Transforms of Sampled Functions*, Theory of Computing, 2012.
5. *Robust Camera Motion Estimation Using Direct Edge Alignment and Sub-Gradient Method*, ICRA 2016.
6. *Edge Enhanced Direct Visual Odometry*, BMVC 2016.
7. *Semi-Dense Visual Odometry for RGB-D Cameras Using Approximate Nearest Neighbour Fields*, ICRA 2017.
8. *Towards Pointless Structure from Motion: 3D Reconstruction and Camera Parameters from General 3D Curves*.
9. *Structure from Motion with Higher-level Environment Representations*.
10. *Edge-Based Robust RGB-D Visual Odometry Using 2-D Edge Divergence Minimization*.
11. *Semi-Dense Visual Odometry for a Monocular Camera*, ICCV 2013.
12. *Canny-VO: Visual Odometry with RGB-D Cameras based on Geometric 3D-2D Edge Alignment*.
13. *RESLAM: A Real-Time Robust Edge-Based SLAM System*.
14. *Robust Monocular Edge Visual Odometry through Coarse-to-Fine Data Association*.
15. *Semantic Nearest Neighbor Fields Monocular Edge Visual-Odometry*.
16. *Semantic and Edge-Based Visual Odometry by Joint Minimizing Semantic and Edge Distance Error*.
17. *Reconstructing 3D Contour Models of General Scenes from RGB-D Sequences*.
18. *Robust and Efficient Edge-Based Visual Odometry*.

</article>
