---
layout: barron
title: "Ground-Constrained SLAM for Mobile Robots"
permalink: /blog/ground-constrained-slam/
hide_page_header: true
mathjax: true
---
<article class="barron-article" markdown="1">
# Ground-Constrained SLAM for Mobile Robots

Zhijian Qiao

<div class="barron-article-actions">
  <a class="blog-card-link" href="https://zhuanlan.zhihu.com/p/497881916" lang="zh-CN">中文版（知乎）</a>
  <a class="blog-card-link" href="{{ '/blog/' | relative_url }}">All posts</a>
</div>

*This is an English translation of my Chinese article.*

## Introduction

Ground contact constrains the motion of a ground robot. This prior can be useful for improving SLAM accuracy. Related approaches include:

- Assuming a flat ground plane and imposing a planar constraint, as in [VINS on Wheels](https://experts.umn.edu/en/publications/vins-on-wheels).
- Assuming the robot is on a plane but applying stricter checks on the ground constraint: [GR-Fusion](https://ieeexplore.ieee.org/abstract/document/9636232) and [Ground-SLAM](https://arxiv.org/ftp/arxiv/papers/2103/2103.03713.pdf).
- Treating the ground as a manifold: [Pose Estimation for Ground Robots: On Manifold Representation, Integration, Re-Parameterization, and Optimization](https://arxiv.org/pdf/1909.03423.pdf), [B-splines for Purely Vision-based Localization and Mapping on Non-holonomic Ground Vehicles](https://ieeexplore.ieee.org/document/9561131), and [Vision-Aided Localization for Ground Robots](https://ieeexplore.ieee.org/document/8968521).
- Incorporating vehicle kinematics: [Visual-Inertial Localization for Skid-Steering Robots with Kinematic Constraints](https://xingxingzuo.github.io/assets/documents/tr_icr.pdf).

## The ground-plane assumption

<p><img src="{{ '/docs/assets/blog/ground-constrained-slam/1.webp' | relative_url }}" alt="Reference frames for a ground-constrained visual-inertial-wheel system" style="max-width:60%;height:auto" /></p>

Figure from the [Chinese article](https://zhuanlan.zhihu.com/p/497881916).

The figure shows six coordinate frames in a typical visual-inertial-wheel (VIW) system: the world frame W, ground-plane frame P, IMU frame {% raw %}$I\_j${% endraw %} and wheel-odometer frame {% raw %}$O\_j${% endraw %} at time j, and IMU frame {% raw %}$I\_k${% endraw %} and odometer frame {% raw %}$O\_k${% endraw %} at time k. We can choose P during initialization; for example, use the initial odometer frame, assuming all four wheels are firmly on the ground. P represents a two-dimensional plane, so its representation differs from those of the other frames. See [plane feature parameterization in SLAM](https://zhuanlan.zhihu.com/p/71924149) for more on plane parameters.

Here we represent P by {% raw %}$R\_w^p${% endraw %} (represented using SO(3), but updated using SO(2)) and {% raw %}$z^p\_{O\_{init}}${% endraw %} (a scalar: the initial O-frame z coordinate in P). The ground constraint has two parts: (1) the z axes of P and O remain parallel, and (2) the distance from O to the XY plane of P remains constant.

Following this definition, we can construct the residual:

{% raw %}$$
r_{3 \times 1}=\left[\begin{array}{cr} {\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}  \left(R_{O}^{I}\right)^{T}  \left(R_{I_{k}}^{w}\right)^{T} \left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}} \\ \mathbf{e}_{3}^{T} R_{w}^{p}\left(R_{I_{k}}^{w} t_{O}^{I}+t_{I_{k}}^{w}\right)-z_{O_{\text {init }}}^{p} \end{array}\right]=\mathbf{0}
$${% endraw %}

The state variables to update include the VIW system rotation {% raw %}$R\_{I\_{k}}^{w}${% endraw %} and translation {% raw %}$t\_{I\_{k}}^{w}${% endraw %}, extrinsic rotation {% raw %}$R\_{O}^{I}${% endraw %} and translation {% raw %}$t\_{O}^{I}${% endraw %} between I and O, and P's rotation {% raw %}$R\_{w}^{p}${% endraw %} and translation {% raw %}$z\_{O\_{\text {init }}}^{p}${% endraw %}.

Before deriving the Jacobians, let us review some Lie-group identities:

{% raw %}$$
[\mathbf{Ra}]_{\times}=\mathbf{R}[\mathbf{a}]_{\times}\mathbf{R}^T
$${% endraw %}

{% raw %}$$
\begin{aligned} \mathbf{J}_{\mathrm{R}}^{\mathrm{R}^{-1}} &=-\mathbf{A} \mathbf{d}_{\mathrm{R}}=-\mathbf{R} \\ \mathbf{J}_{\mathrm{QR}}^{\mathrm{QR}} &=\mathbf{A} \mathbf{d}_{\mathrm{R}}{ }^{-1}=\mathbf{R}^{\top} \\ \mathbf{J}_{\mathrm{R}}^{\mathrm{QR}} &=\mathbf{I} \end{aligned}
$${% endraw %}

{% raw %}$$
\begin{array}{r} \mathbf{J}_{\mathrm{R}}^{\mathrm{R} \cdot \mathbf{v}} \triangleq \lim _{\boldsymbol{\theta} \rightarrow 0} \frac{(\mathbf{R} \oplus \boldsymbol{\theta})_{\mathbf{v}}-\mathbf{R} \mathbf{v}}{\boldsymbol{\theta}}= \\ \lim _{\boldsymbol{\theta} \rightarrow 0} \frac{\mathbf{R} \operatorname{Exp}(\boldsymbol{\theta}) \mathbf{v}-\mathbf{R} \mathbf{v}}{\boldsymbol{\theta}}=\lim _{\boldsymbol{\theta} \rightarrow 0} \frac{\mathbf{R}\left(\mathbf{I}+[\boldsymbol{\theta}]_{\times}\right) \mathbf{v}-\mathbf{R v}}{\boldsymbol{\theta}} \\ =\lim _{\boldsymbol{\theta} \rightarrow 0} \frac{\mathbf{R}[\boldsymbol{\theta}]_{\times} \mathbf{v}}{\boldsymbol{\theta}}=\lim _{\boldsymbol{\theta} \rightarrow 0} \frac{-\mathbf{R}[\mathbf{v}]_{\times} \boldsymbol{\theta}}{\boldsymbol{\theta}}=-\mathbf{R}[\mathbf{v}]_{\times} \end{array}
$${% endraw %}

{% raw %}$$
\mathbf{J}_{\mathbf{v}}^{\mathbf{R} \cdot \mathbf{v}} \triangleq \lim _{\partial \mathbf{v} \rightarrow 0} \frac{\mathbf{R}(\mathbf{v}+\partial \mathbf{v})-\mathbf{R} \mathbf{v}}{\partial \mathbf{v}}=\mathbf{R}
$${% endraw %}

Here Q and R are rotation matrices, a and v are vectors, Ad denotes the adjoint, and J denotes a Jacobian. See [A Micro Lie Theory for State Estimation in Robotics](https://arxiv.org/pdf/1812.01537.pdf) for derivations.

The first two residual components have the following Jacobian with respect to VIW rotation {% raw %}$R\_{I\_{k}}^{w}${% endraw %}, denoted {% raw %}$\mathbf{J}\_{R\_{{{I}\_{k}}}^{w}}^{{{r}\_{2\times 1}}}${% endraw %}:

{% raw %}$$
\begin{array}{l} \mathbf{J}_{R_{{{I}_{k}}}^{w}}^{{{r}_{2\times 1}}}=\frac{\partial\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T}\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}}{\partial R_{I_{k}}^{w}}\\ =\frac{\partial\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T}\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T}\mathbf{e}_{3}}{\partial\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}} \times \frac{\partial\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}}{\partial\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T}} \times \frac{\partial\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T}}{\partial\left(R_{I_{k}}^{w}\right)^{T}} \times \frac{\partial\left(R_{I_{k}}^{w}\right)^{T}}{\partial R_{I_{k}}^{w}}\\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T} \times\left(-\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T}\left[\mathbf{e}_{3}\right]_{\times}\right) \times R_{w}^{p} \times\left(-R_{I_{k}}^{w}\right)\\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T} \times\left(\left(R_{w}^{p} R_{I_{k}}^{w}\right)^{T}\left[\mathbf{e}_{3}\right]_{\times}\left(R_{w}^{p} R_{I_{k}}^{w}\right)\right)\\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T}\left[\left(R_{w}^{p} R_{I_{k}}^{w}\right)^{T} \mathbf{e}_{3}\right]_{\times} \end{array}
$${% endraw %}

Similarly, we obtain {% raw %}$\mathbf{J}\_{R\_{{w}}^{p}}^{{{r}\_{2\times 1}}}${% endraw %}:

{% raw %}$$
\begin{array}{l} \mathbf{J}_{R_{w}^{p}}^{r_{2\times1}}=\frac{\partial\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T}\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}}{\partial R_{w}^{p}}\\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T} \times\left(-\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T}\left[\mathbf{e}_{3}\right]_{x}\right) \times \frac{\partial\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T}}{\partial\left(R_{w}^{p}\right)^{T}} \times \frac{\partial\left(R_{w}^{p}\right)^{T}}{\partial R_{w}^{p}}\\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T} \times\left(-\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T}\left[\mathbf{e}_{3}\right]_{\times}\right) \times\left(-R_{w}^{p}\right)\\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T} \times\left(R_{I_{k}}^{w}\right)^{T} \times\left(\left(R_{w}^{p}\right)^{T}\left[\mathbf{e}_{3}\right]_{\times}\left(R_{w}^{p}\right)\right)\\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left(R_{O}^{I}\right)^{T}\left(R_{I_{k}}^{w}\right)^{T}\left[\left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}\right]_{\times} \end{array}
$${% endraw %}

Although P's rotation {% raw %}$R\_w^p${% endraw %} has three degrees of freedom, we update only two to avoid overparameterization. For example, set the last column of this 2×3 matrix to zero, and set the corresponding yaw to zero when initializing {% raw %}$R\_w^p${% endraw %}.

Similarly, for {% raw %}$\mathbf{J}\_{R\_{O}^{I}}^{r\_{2\times1}}${% endraw %}:

{% raw %}$$
\begin{array}{l} \mathbf{J}_{R_{O}^{I}}^{r_{2\times1}}=\frac{\partial\left[\mathbf{e}_{1} \quad \mathbf{e}_{2}\right]^{T}\left(R_{O}^{I}\right)^{T}\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}}{\partial R_{O}^{I}} \\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T} \times \frac{\partial\left(R_{O}^{I}\right)^{T}\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}}{\partial\left(R_{O}^{I}\right)^{T}} \times \frac{\partial\left(R_{O}^{I}\right)^{T}}{\partial R_{O}^{I}} \\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T} \times\left(-\left(R_{O}^{I}\right)^{T}\left[\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}\right]_{\times}\right) \times\left(-R_{O}^{I}\right) \\ =\left[\begin{array}{ll} \mathbf{e}_{1} & \mathbf{e}_{2} \end{array}\right]^{T}\left[\left(R_{O}^{I}\right)^{T}\left(R_{I_{k}}^{w}\right)^{T}\left(R_{w}^{p}\right)^{T} \mathbf{e}_{3}\right]_{\times} \end{array}
$${% endraw %}

Finally, the Jacobians of the last residual component with respect to each optimization variable are:

{% raw %}$$
\mathbf{J}_{R_{I_{k}}^{w}}^{r_{1\times1}}=\frac{\partial\left(\mathbf{e}_{3}^{T} R_{w}^{p}\left(R_{I_{k}}^{w} t_{O}^{I}+t_{I_{k}}^{w}\right)-z_{O_{\text{init}}}^{p}\right)}{\partial R_{I_{k}}^{w}}=-\mathbf{e}_{3}^{T} R_{w}^{p} R_{I_{k}}^{w}\left[t_{O}^{I}\right]_{\times}
$${% endraw %}

{% raw %}$$
\mathbf{J}_{t_{t_{k}}^{w}}^{r_{1\times1}}=\frac{\partial\left(\mathbf{e}_{3}^{T} R_{w}^{p}\left(R_{I_{k}}^{w} t_{O}^{I}+t_{I_{k}}^{w}\right)-z_{O_{\text {init}}}^{p}\right)}{\partial t_{I_{k}}^{w}}=\mathbf{e}_{3}^{T} R_{w}^{p}
$${% endraw %}

{% raw %}$$
\mathbf{J}_{t_{O}^{I}}^{r_{1\times1}}=\frac{\partial\left(\mathbf{e}_{3}^{T} R_{w}^{p}\left(R_{I_{k}}^{w} t_{O}^{I}+t_{I_{k}}^{w}\right)-z_{O_{\mathrm{init}}}^{p}\right)}{\partial t_{O}^{I}}=\mathbf{e}_{3}^{T} R_{w}^{p} R_{I_{k}}^{w}
$${% endraw %}

{% raw %}$$
\mathbf{J}_{R_{w}^{p}}^{r_{1\times1}}=\frac{\partial\left(\mathbf{e}_{3}^{T} R_{w}^{p}\left(R_{I_{k}}^{w} t_{O}^{I}+t_{I_{k}}^{w}\right)-z_{O_{\text {init }}}^{p}\right)}{\partial R_{w}^{p}}=-\mathbf{e}_{3}^{T} R_{w}^{p}\left[R_{I_{k}}^{w} t_{O}^{I}+t_{I_{k}}^{w}\right]_{\times}
$${% endraw %}

{% raw %}$$
\mathbf{J}_{z_{O_{\text {init }}}^{p}}^{r_{1\times1}}=\frac{\partial\left(\mathbf{e}_{3}^{T} R_{w}^{p}\left(R_{I_{k}}^{w} t_{O}^{I}+t_{I_{k}}^{w}\right)-z_{O_{\text {init }}}^{p}\right)}{\partial z_{O_{\text {init }}}^{p}}=-1
$${% endraw %}

## References

- [VINS on Wheels](https://experts.umn.edu/en/publications/vins-on-wheels).
- [VIW-Fusion](https://github.com/TouchDeeper/VIW-Fusion).
- [A Micro Lie Theory for State Estimation in Robotics](https://arxiv.org/pdf/1812.01537.pdf).

</article>
