---
layout: barron
title: "Some Thoughts on Point Cloud Registration"
permalink: /blog/point-cloud-registration/
hide_page_header: true
mathjax: true
---
<article class="barron-article" markdown="1">

# Some Thoughts on Point Cloud Registration

Zhijian Qiao

<div class="barron-article-actions">
  <a class="blog-card-link" href="https://zhuanlan.zhihu.com/p/694366189" lang="zh-CN">中文版（知乎）</a>
  <a class="blog-card-link" href="{{ '/blog/' | relative_url }}">All posts</a>
</div>

## Preface

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/animation-01.webp' | relative_url }}" alt="Illustration of point cloud registration" style="max-width:60%;height:auto" /></p>

*Point cloud registration, from the [Chinese original](https://zhuanlan.zhihu.com/p/694366189). Animated illustration from the original post.*

Point cloud registration is one of the fundamental tasks in computer vision and robotics. A recent paper of ours on the subject was accepted, so I thought I would write down some of my thoughts. I hope they are useful to anyone interested in the problem. If you disagree with anything, please feel free to leave a comment or send me an email.

A little aside: my first paper in graduate school [1] was also on point cloud registration. I did not have many ideas at the time, but a senior student helped me get started. I was lucky: the ideas he gave me worked, the numbers beat the state of the art, and the paper was accepted. At my thesis defense, a professor asked a question that sounded simple but cut to the heart of the matter: “You have done a lot of work, but what exactly is your research topic? Do you work on point cloud registration?” My first, rather conceited thought was, “Of course not; registration is only one part.” But the contradiction was that my experience and understanding of this classic task amounted to little more than training networks and chasing metrics. I could hardly claim to have studied it.

Looking back, I should not have been so dismissive. Point cloud registration may look like a small problem, but it involves plenty of data association, graph theory, probability, and optimization. Its foundations overlap substantially with those of more comprehensive tasks such as SLAM. It reminds me of the saying that governing a large country is like cooking a small fish: even a small task requires care.

On to the topic. I will not explain individual algorithms in detail here. Instead, I want to discuss registration from a broader perspective and point to papers for further reading. This problem has been studied for many years, so a complete survey is difficult. My knowledge does not cover all previous work either; please add other good approaches in the comments.

## The point cloud registration problem

When I learn about a task, I like to start with its inputs and outputs, look at individual methods, group them, and then think about the nature of the problem and its difficult points.

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/measurement.png' | relative_url }}" alt="Two sensors observe an object from different viewpoints" style="max-width:60%;height:auto" /></p>

*Two observations of the same object. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

Imagine measuring a real object, such as the airplane below, with two range sensors, such as LiDAR. The measurements produce two point clouds, usually called the source and target. Each consists of XYZ coordinates in its own sensor frame. Registration takes the two point clouds as input and finds a pose that transforms the source to align with the target as closely as possible. That alignment gives us the optimization objective.

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-03.webp' | relative_url }}" alt="Point clouds, overlap and point correspondence" style="max-width:60%;height:auto" /></p>

*Sampling and overlap. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

There are several challenges:

1. We generally know nothing about the ground-truth pose: there is **no reliable initial transformation**.
2. A point cloud is a discrete sampling of a continuous object, so there may be **no exact point-to-point correspondence**. In the figure, the exact counterpart of $x_i$ would be $y_i$, but $y_i$ is not actually sampled; we can only find an approximate match, such as a nearby gray star.
3. Each sensor usually observes only one side, so the clouds have **partial overlap**, such as regions $Q_1$ and $Q_2$ in the figure.
4. Worse still, the sensors may differ. Their measurement errors and point distributions can differ too—for example, in accuracy, field of view, or scanning pattern. This is the **cross-modal** case.

The first challenge gives us global (or coarse) and local (or fine) registration. The former assumes no useful pose prior; the latter starts from a reasonably good one. In robotics, loop closure, relocalization, and multi-session SLAM usually need global registration because they lack a trustworthy initial pose. LiDAR odometry, by contrast, is generally local registration: consecutive frames tend to have a relative pose close to the identity.

A general solution to registration would be exciting, but a practical application does not necessarily need one. We can often work around these four challenges:

- **Initial pose.** Even in global registration, such as loop closure, we may have partial prior information. If a vehicle collects the scans on the ground, relative pitch and roll are likely close to zero. This greatly reduces the pose search space.
- **No exact correspondences.** Noisy measurements can still yield an accurate pose in a least-squares problem. For global registration, precision may be less important initially because ICP [2] or NDT [3] can refine the result. Point-to-plane and point-to-line ICP, NDT, and the more general GICP [4] do not rely solely on point-to-point losses: they compare against lines, planes, or Gaussian distributions, reducing the effect of missing exact correspondences.
- **Partial overlap.** In local registration, a good pose prior often tells us where the overlap is. For global registration, we can split the clouds into patches, for example uniformly, and match those. This increases the chance of finding a pair within the overlap; one correctly matched patch can register the whole cloud.
- **Cross-modal measurements.** In many applications, the two clouds simply come from the same type of sensor.

## Common registration frameworks

Let us group registration pipelines and connect them to particular algorithms. Different settings and implementations make it hard to call one framework absolutely good or bad.

### Framework 1: end-to-end registration

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-04.webp' | relative_url }}" alt="End-to-end registration framework" style="max-width:60%;height:auto" /></p>

*End-to-end registration. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

The most direct idea is to feed two point clouds into a powerful model and get a pose out, as in PWCLO-Net [5] and PointNetLK [6]. Such methods use the fitting power of neural networks and can be both fast and accurate when training and test distributions agree. From another perspective, however, the network maps two $N\times3$ point clouds into pose space, which has six dimensions in a minimal representation. This is a very flexible mapping, and pose supervision alone may not be enough to learn it correctly [7].

### Framework 2: searching for the best pose

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-05.webp' | relative_url }}" alt="Pose-search registration framework" style="max-width:60%;height:auto" /></p>

*Pose search. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

This resembles repeatedly trying different transformations of the source until it aligns with the target. References [10] and [11] use branch and bound. There are two main concerns: searching efficiently by managing and reducing the search space, and evaluating each candidate quickly, since every search step needs an objective value or score.

### Framework 3: correspondence construction and robust pose estimation

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-06.webp' | relative_url }}" alt="Correspondence and robust estimation framework" style="max-width:60%;height:auto" /></p>

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/animation-07.gif' | relative_url }}" alt="Illustration of point cloud correspondences" style="max-width:60%;height:auto" /></p>

*Correspondences and robust pose estimation. Sources: [Chinese original](https://zhuanlan.zhihu.com/p/694366189); the second image is animated.*

Many registration algorithms have two steps: build correspondences and robustly estimate the pose. We can call these the front end and the back end. A common front end extracts keypoints, such as ISS, and descriptors, such as FPFH, and matches the descriptors. If the correspondences are correct—whether point-to-point, distribution-to-distribution, or point-to-line—we can construct an objective and obtain the pose with a closed-form solution such as SVD [8].

Reality is less tidy: correspondences often contain outliers, broadly including points outside the overlap, dynamic objects, and incorrect matches. Rather than treating each type separately, we often use a general outlier-removal method, such as a graph-based method [9], then build an objective from the remaining correspondences. A robust kernel can further reduce the effect of outliers that survive [9].

ICP also fits this framework. It uses a prior pose and nearest-neighbor search to obtain correspondences, restricts the search range to remove likely mismatches, and then uses SVD to estimate the pose.

Framework 2 tries poses to align the clouds. Framework 3 instead obtains an alignment target in advance: the correspondences. It turns the problem of finding the best pose in a large pose space into finding accurate matches and removing incorrect ones. That sounds like an extra step, but data association and robust estimation are classic topics in computer vision and robotics, with many useful methods to draw on.

### Framework 4: a more general view

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-08.webp' | relative_url }}" alt="A general point cloud registration framework" style="max-width:60%;height:auto" /></p>

*The general framework. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

We can try to bring the three frameworks together. The diagram has two parts, outlined in green and brown. Point clouds are processed into **registration units** and **evaluation units**. Either can be the original cloud, a downsampled cloud, keypoints, an occupancy grid or voxels, segments, and so on; the distinction is how they are used.

In the first part, registration units define an objective from which one or more pose candidates are generated. For example, we can use keypoints as registration units, match their descriptors, and minimize distances between matched points. In the second part, evaluation units define a measure of alignment quality for a given pose. In the pose-search framework, for example, branch and bound often turns the target into an occupancy grid. Transforming the source into that grid gives occupancy probabilities with which to assess alignment.

In framework 1, the network uses raw or downsampled points as registration units during training; the training loss plays the role of the registration objective. At inference, the trained network directly computes a pose from those units.

The following two framework labels appear reversed in the Chinese original relative to the definitions above; I preserve the descriptions and identify them by their contents here. In correspondence-based registration, the registration and evaluation units are the same and the registration objective and alignment-quality function sum to zero. It considers alignment of the registration units—for example, keypoints—to stand for alignment of the clouds. Equivalently, only the first part is needed because there is one pose candidate. In pose search, there is no separately designed registration unit or registration objective: the candidate set is the entire possible pose space, and an alignment-quality function selects the best pose.

Is there a concrete method that uses both parts of framework 4? Yes: classic keypoint matching plus RANSAC. Given $N$ correspondences, RANSAC repeatedly samples three to generate a pose candidate and scores it by the number of correspondences consistent with it. G3Reg [14] similarly generates several pose candidates in the first stage and chooses the best in the second. GeoTransformer [12] also generates a pose candidate from dense point matches within each matched patch, then selects the best using all point matches.

### Questions worth asking

Rather than focus on a particular algorithm, consider questions that apply to any design:

- **What makes good correspondences?** A higher inlier ratio makes life easier for the back end, and lower runtime never hurts. We also need at least three correct correspondences for point cloud registration.
- **What makes a good registration unit?** If we use points, lines, or planes, are they common, salient, and repeatable in the intended setting? Keypoints in point clouds, especially sparse LiDAR scans, often have poor repeatability. A common alternative is voxel downsampling followed by a descriptor for each remaining point. Indoors, point features may be scarce, while lines and planes are relatively abundant.
- **What makes a good evaluation unit?** Aligning keypoints shows that part of each cloud aligns, not necessarily that the two original clouds align.
- **What makes good objectives?** Even raw clouds often overlap only partially, so some points cannot align. A common approach treats non-overlap as outliers and uses a robust kernel. If the registration objective is non-convex, how do we find its global optimum? Even if we do, does that prove the clouds are aligned? Likewise, does the candidate maximizing the alignment score have to be the best one? I sound like I am arguing for the sake of it, but these questions matter.
- **Does alignment imply the pose is correct?** Repeated structures such as corridors and roads can give visually good alignment at a wrong pose. Such scenes are sometimes called degenerate. Can we measure their degree of degeneracy, or the confidence in a registration result [32]?

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-09.webp' | relative_url }}" alt="Repeated structures give two plausible alignments" style="max-width:60%;height:auto" /></p>

*Two positions can both look correctly aligned. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

- **How can we remove wrong matches?** Options include similarity in feature space, such as mutual nearest neighbors; geometric consistency, such as distance preservation under rigid transformation [9]; and robust estimation, such as adding a robust kernel to the objective.

## Building correspondences

The next sections take a closer look at framework 3, starting with its front end. We can divide it into three parts: downsample the cloud to obtain registration units such as keypoints; construct descriptors for those units; and choose a matching strategy. We generally avoid registering every raw point both because weak features can increase ambiguity and because the data may be too large to process efficiently.

Another aside: when introducing a field, people often list as many methods as possible and describe the advantages of each. As I wrote this, I wondered whether starting with the goal might be a calmer and more efficient approach. That does not mean reaching the end and starting over; it means knowing what we want before trying to achieve it. My undergraduate competition adviser once said that the final ranking is effectively set when the plan is chosen. A goal sets an upper bound on the result and guides what we do. So let us first ask what a good registration unit looks like, then consider examples.

- **Frequency and repeatability.** A unit should occur often in the scene—for example, planes are more plentiful than point features indoors. The same unit should also appear in both scans as often as possible, making a correct match more likely.
- **Saliency.** Corners are an intuitive example: they tend to be less ambiguous and easier to match.
- **Representation of the original structure.** “Roughly representing” a cloud is vague and open to interpretation. As a counterexample, four points sampled from an outdoor cloud may match, but many other groups of four may have the same geometry. Matching them does not establish that the original clouds align. On the other hand, using every raw point may take too long.

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-10.webp' | relative_url }}" alt="Segments used as registration units" style="max-width:60%;height:auto" /></p>

*Segments as registration units. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

Some common choices are:

- **Voxel-downsampled points [12].** They retain the original geometry without greatly affecting accuracy and save registration time. An occupancy grid [10] goes further by representing occupied, free, and unknown states.
- **Keypoints [13].** These are often corners in the cloud, intended to be salient and repeatable. Extracting them reduces both computation and matching ambiguity.
- **Segments [14, 15, 25].** Geometric clustering produces segments; semantic segmentation produces segments with labels, which help matching but add a dependency on a segmentation model. Segments are not used very often, perhaps because their centers seem inaccurate. I think they are a useful unit: they retain much of the scene structure while remaining sparse. With reasonable modeling of center uncertainty, as in G3Reg [14], they can register well.
- **Sets of keypoints.** Examples include triangles made of three points [16, 17] and quadrilaterals made of four [18].

The second part computes a descriptor for each unit. Distances between descriptors express similarity, allowing nearest-neighbor search to find correspondences. A good descriptor should have:

- **Locality:** record information around the unit, or within it if it is large enough, in addition to its coordinates.
- **Discriminativeness:** make descriptors of the same spatial point close and those of different points far apart.
- **Compactness and efficiency:** lower dimensionality speeds up nearest-neighbor queries, and descriptor extraction should also be efficient.
- **Rotation and translation invariance:** without an initial pose in global registration, descriptors of the same unit should remain similar in any coordinate frame.

How do common methods achieve these properties?

- For locality, neighboring points are incorporated through nearest-neighbor queries [19] or voxel convolutions [20].
- For discriminativeness, handcrafted methods depend mainly on feature design; learned methods commonly use data augmentation and metric-learning losses [20, 12].
- Descriptors are often low-dimensional, for example 33-dimensional, and indexed with a KD-tree. Some, such as triangle descriptors, have low dimension and a standardized definition that permits faster hash-table lookup. Examples appear in robotics [17] and surveying [16].
- Rotation and translation invariance can be built in through invariant quantities such as lengths and angles [19], through a local reference frame [21], or through the architecture of a learned model [22].

Finally, matching strategy involves a trade-off between robustness and efficiency. For speed, we can keep only mutually most-similar descriptors and require the best match to be much better than the second-best. But this can discard correct matches, perhaps leaving fewer than three. At the other extreme, all-to-all matching [23] ignores descriptors. If units are repeatable, it will likely contain three correct matches, but the outlier rate can be very high. Mutual top-$K$ descriptor matches may be a compromise, though the right choice depends on the application. Reference [24] gives one practical strategy.

## Removing outliers

Sometimes I feel researchers put too much emphasis on data association. In registration, SLAM, and other vision and robotics tasks, we often say that if the front end supplies correct correspondences, the back end needs little improvement and the system will work. That is true, but in practice we may need a weaker front end for speed, or simply be unable to build a strong one. Perhaps people—or perhaps just beginners like me—underestimate the value of a back end that can handle a huge number of outliers.

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-11.webp' | relative_url }}" alt="A robust back end with many outlier correspondences" style="max-width:60%;height:auto" /></p>

*A strong back end [14] can handle correspondences with an outlier rate as high as 99%. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

As noted above, outlier removal and robust pose estimation are classic topics in robust statistics, vision, and robotics [26]. Two common ideas are M-estimators, which use robust kernels, and maximum consensus. The figure shows several robust kernels.

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-12.webp' | relative_url }}" alt="Examples of robust loss functions" style="max-width:60%;height:auto" /></p>

*Robust kernels. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

A robust kernel limits the contribution of large residuals to the objective. But residuals depend on the current state—the pose in registration—so initialization affects an M-estimator's accuracy and whether it reaches a global optimum. When a good initial solution is unavailable, we often solve the problem using graduated non-convexity (GNC) [27]. The idea is to relax the robust kernel into a convex function and progressively restore the original one. At each stage, the previous solution updates measurement weights, reducing the weight of outliers [27], or initializes the next stage [33]. *Translator's note:* The original post describes this as a way to seek a global optimum; the procedure alone does not guarantee one for every problem.

I am particularly fond of maximum consensus. Among all correspondences, we seek mutually consistent subsets and often regard the largest as the inlier set. The definition of consistency depends on the method and task.

RANSAC is a classic heuristic for maximum consensus: it counts the samples consistent with each model hypothesis and selects the hypothesis with the largest count. But its random sampling has exponential complexity at high outlier rates [28]. If the front end is poor, RANSAC may not be a good choice for the back end.

Another approach I like uses graph theory [9, 14, 23, 29].

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-13.webp' | relative_url }}" alt="A compatibility graph and its cliques" style="max-width:60%;height:auto" /></p>

*Compatibility graph. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

We build a compatibility or consistency graph from the input correspondences. Each node represents one correspondence; an edge connects two nodes when they pass a consistency test. A clique is a subgraph in which every pair of nodes is connected. A graph may contain several cliques, and a clique may contain smaller cliques. A **maximal** clique is not contained in a larger clique; a **maximum** clique is a maximal clique with the greatest number of nodes. A central idea of maximum consensus is that the inliers often form a maximum clique [9]. Other work considers maximal cliques instead [29].

<p align="center"><img src="{{ '/docs/assets/blog/point-cloud-registration/figure-14.webp' | relative_url }}" alt="Consistency test using rigid distance preservation" style="max-width:60%;height:auto" /></p>

*Rigid transformations preserve distance. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

The consistency test above uses the fact that a rigid transformation preserves length. The diagram is easier to understand, but I should explain it in words too: if the distance between two matched points changes by more than a threshold, at least one of the two correspondences is considered wrong.

**Maximum versus maximal clique.** In the ideal consistency model, inlier correspondences satisfy the rigid transformation and therefore form a clique. Whether it is the largest depends on the front-end matches. Usually we expect it to be, but there are exceptions. First, in repeated scenes such as corridors, feature matches can be confused. We might need better descriptors, several candidate solutions, extra information such as door numbers, or simply wait for the robot to leave the corridor. Second, one part of cloud A may be incorrectly matched densely to part of cloud B; those incorrect correspondences may themselves form a large clique. This is especially plausible with dense matching. Voxel-downsampling the correspondences is a simple remedy. Treating the correct clique as maximal rather than necessarily maximum is a more general alternative.

A crucial but often overlooked question is how to choose the threshold. Ideally it would be close to zero. In practice, errors in extracting and matching registration units make it difficult to choose and potentially different for each instance. G3Reg [14] and Pagor [30] therefore use multiple thresholds to build multiple consistency graphs and obtain several maximum cliques, or possible inlier sets. They estimate several candidate poses and verify them to select the best. The papers call this “distrust and verify”; it could also be called hypothesis generation and evaluation. In practice it improves robustness substantially, often producing the correct pose even with a weak front end. The video below shows G3Reg registration under low overlap.

<video controls preload="metadata" style="max-width:100%;height:auto" src="{{ '/docs/assets/blog/point-cloud-registration/g3reg-low-overlap.mp4' | relative_url }}"></video>

*G3Reg under low overlap. Source: [Chinese original](https://zhuanlan.zhihu.com/p/694366189).*

Graph-based methods still have limitations. Constructing a consistency graph requires quadratic time and memory in the number of correspondences, which is unacceptable when that number is large [31].

## Closing

By now this may read like a promotional post whose intent could not be more obvious—only a “Crazy Thursday at KFC” line is missing. Still, I hope you will forgive my small indulgence after I have shared what I learned about registration. There are better methods I have not explained in detail or have omitted for lack of space. If you want to work in this area, following the references should lead you to a broader view of the field.

Thank you for reading!

## References

【1】End-to-End 3D Point Cloud Learning for Registration Task Using Virtual Correspondences

【2】[Iterative closest point](https://en.wikipedia.org/wiki/Iterative_closest_point) — Wikipedia

【3】[Normal distributions transform](https://en.wikipedia.org/wiki/Normal_distributions_transform)

【4】Generalized-ICP

【5】PWCLO-Net: Deep LiDAR Odometry in 3D Point Clouds Using Hierarchical Embedding Mask Optimization

【6】PointNetLK: RobustR & Efficient Point Cloud Registration using PointNet

【7】Correspondence Matrices are Underrated

【8】Least-squares fitting of two 3D point sets

【9】TEASER: Fast and Certifiable Point Cloud Registration

【10】Real-time loop closure in 2D LIDAR SLAM

【11】3D-BBS: Global Localization for 3D Point Cloud Scan Matching Using Branch-and-Bound Algorithm

【12】Geometric Transformer for Fast and Robust Point Cloud Registration

【13】D3Feat: Joint Learning of Dense Detection and Description of 3D Local Features

【14】G3Reg: Pyramid Graph-based Global Registration using Gaussian Ellipsoid Model

【15】SegMatch: Segment based place recognition in 3D point clouds

【16】Automatic registration of large-scale urban scene point clouds based on semantic feature points

【17】STD: Stable Triangle Descriptor for 3D place recognition

【18】Keypoint-based 4-Points Congruent Sets – Automated marker-less registration of laser scans

【19】Fast Point Feature Histograms (FPFH) for 3D registration

【20】Fully Convolutional Geometric Features

【21】SpinNet: Learning a General Surface Descriptor for 3D Point Cloud Registration

【22】RoReg: Pairwise Point Cloud Registration with Oriented Descriptors and Local Rotations

【23】CLIPPER: A Graph-Theoretic Framework for Robust Data Association

【24】Stress-Testing Point Cloud Registration on Automotive LiDAR

【25】Outram: One-shot Global Localization via Triangulated Scene Graph and Global Outlier Pruning

【26】Estimation Contracts for Outlier-Robust Geometric Perception

【27】Graduated Non-Convexity for Robust Spatial Perception: From Non-Minimal Solvers to Global Outlier Rejection

【28】Performance Evaluation of RANSAC Family

【29】3D Registration With Maximal Cliques

【30】Pyramid Semantic Graph-based Global Point Cloud Registration with Low Overlap

【31】ARCS: Accurate Rotation and Correspondence Search

【32】Learning-based Localizability Estimation for Robust LiDAR Localization

【33】Robust Incremental Smoothing and Mapping (riSAM)

</article>
