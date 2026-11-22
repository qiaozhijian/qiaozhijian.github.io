---
layout: barron
title: "How World Models Can Help Robots Plan"
permalink: /blog/world-models-for-robot-planning/
hide_page_header: true
---

<article class="barron-article" markdown="1">

# How World Models Can Help Robots Plan

Zhijian Qiao · Chinese original last edited March 12, 2026

<div class="barron-article-actions">
  <a class="blog-card-link" href="https://zhuanlan.zhihu.com/p/2010015565465551630" lang="zh-CN">中文版（知乎）</a>
  <a class="blog-card-link" href="{{ '/blog/' | relative_url }}">All posts</a>
</div>

*This is an English translation of my [Chinese article on Zhihu](https://zhuanlan.zhihu.com/p/2010015565465551630). The slides below are from the original article.*

## Introduction

At the end of last year, I finally submitted a SLAM paper that had been in the works for a long time. It may be my last first-author paper on the topic. These days, of course, we no longer call it SLAM: it is “spatial intelligence,” and robots have become “embodiment.” When I started my PhD, ChatGPT did not exist yet, and robots still needed a map before they could carry out a task. A year later, ChatGPT came along. My classmates and I sometimes joke that we joined the wrong army in 1949. Whether that is true or not, perhaps there is still time to rethink things.

After submitting the paper, I started learning about world models, VLAs, and other popular directions. Here are seven ways I think world models can help robot planning.

## A world model as a state predictor

There does not seem to be a universally accepted definition of a world model. In the context of reinforcement learning, we might define it as a state predictor: given past states and a condition, it predicts a future state, possibly with a reward.

In reinforcement learning, “state” covers a lot. It includes the environment, such as its geometry and texture, as well as the agent's own pose and joint angles. The condition drives a state transition. Depending on the application, it could be a direction key in a game, or a text instruction such as “go forward” or “find a red ball” in robot navigation.

We usually cannot model the whole state and can only observe part of it. Some world models therefore work with observations instead. An image is an observation, or a sample, of the environment. A sequence of images can also reveal changes in the agent's own state. In a video world model, video takes the place of state: pixels are the state.

Not everyone will agree with the definition on this slide. But if we adopt it, many lines of work can fit into one framework and give us a more unified perspective.

{% include blog_figure.html image="01" alt="A world model predicts the next state from state history and a condition." %}

This is a classic nine-grid meme, a little like “everything is NeRF.” Depending on how we define state and condition, ChatGPT, Sora, NeRF, and even an end-to-end planner can all become world models. SLAM, unfortunately, drops out of the grid because it models the past.

{% include blog_figure.html image="02" alt="A taxonomy of world models by state representation and condition." %}

### ChatGPT is a world model

If the state consists of image and text tokens and the condition is a prompt, an MLLM is a world model. For an LLM, this world is described in words, rather like a role-playing game. If you ask what 2026 will be like, I am sure the LLM world model will give you a satisfactory answer.

{% include blog_figure.html image="03" alt="An MLLM predicts future tokens autoregressively from visual and textual context." %}

### A latent world model

JEPA is also a world model, operating in latent space. In V-JEPA, a continuous part of a video, such as a future segment, is masked. JEPA predicts the latent of the masked segment from the past. The idea is that much of the visual detail in the world is not worth learning, so predicting every pixel is unnecessary and computationally wasteful.

It is hard for us to picture what JEPA's latent world looks like, but perhaps this is the right representation for a robot agent.

{% include blog_figure.html image="04" alt="JEPA predicts latent representations for a masked region from visible patches." %}

### The most entertaining world models

Video models such as Sora and Seedance are world models too. Whether conditioned on camera poses or only on text, today's models can often generate a future video consistent with the condition. For a robotics researcher, however, an entertaining video is not always good news. A video that seriously violates physics may be fun to watch, but it can mislead a robot.

{% include blog_figure.html image="05" alt="A video world model predicts future image frames from past images and a condition." %}

### NeRF is a world model too!

When NeRF was popular, everything seemed to be a kind of NeRF. Now the tables have turned: NeRF has become a world model, more precisely one confined to a particular region of space and time. If a reconstructed 4D NeRF or Gaussian-splatting scene is the state, and a viewpoint, position, or time is the query, we can obtain observations within the space-time range represented by the model.

{% include blog_figure.html image="06" alt="A neural 3D or 4D scene representation renders an observation for a query viewpoint." %}

### A simulator is a world model

Simulators such as NVIDIA Isaac Sim and CARLA predict what an agent will observe next and how it can interact with the world. They are clearly world models under this definition. Their simulations may not be realistic enough, however, which can leave a sim-to-real gap.

{% include blog_figure.html image="07" alt="A physics simulator predicts the next state and observation from state and action." %}

### How can an end-to-end planner be a world model?

Surprisingly, an end-to-end planner also fits our original definition. A world model predicts state, but we allow it to take in or output only a part of the state because the full state is not observable. A robot trajectory is part of that state. An end-to-end planner that takes past video or other observations and predicts a future trajectory can therefore be called a world model too.

This may sound tongue-in-cheek, but thinking this way opens up possibilities. Below are seven paths for using world models to help planning. For each one, the slides show how it works, why it may help, and related work.

{% include blog_figure.html image="08" alt="An end-to-end planner predicts a future ego trajectory from observation history and a condition." %}

## Path 1: A world model as a planning prior

The first idea is straightforward. We can use a world model to train a good feature encoder. Intuitively, this gives a planner general knowledge about the world. For example, video prediction may capture multi-view geometry, including the feature matching and triangulation that we keep revisiting in SfM and SLAM. Even internet vlogs, rather than robot videos, can provide information from which to learn such knowledge.

During pretraining, we learn an encoder. When training the robot planner, we remove the original predictor, such as a video-prediction head, and attach a lightweight planning or decision network. This lets the planner use the general knowledge learned during pretraining without paying the inference cost of dense future-state prediction.

{% include blog_figure.html image="09" alt="Path 1: a video-pretrained encoder is reused by a lightweight planner." %}

## Path 2: Thinking fast and slow

In the first path, general knowledge is stored in network parameters. The second injects it more explicitly: a VLM produces a high-level plan at a low frequency, while an end-to-end planner executes at a higher frequency.

A fast-slow design sounds sensible and human-like, but it raises two questions:

1. In an emergency, the slow system may be too slow to issue an instruction. Can the fast system recognize that the old instruction is obsolete and choose a better action on its own?
2. The two systems are separate, so reducing the train-test gap matters. For example, should the fast system be trained on ground-truth high-level instructions or instructions generated by the slow system? There is a trade-off between performance and efficiency.

{% include blog_figure.html image="10" alt="Path 2: a slow vision-language model provides high-level decisions to a fast action system." %}

## Path 3: VLA and a chain of reasoning

VLA is the fashionable answer these days. Ask a robotics graduate student what they work on and, chances are, this is it!

VLA is a more tightly coupled approach that brings planning into an MLLM framework. It takes vision and instruction tokens, produces a chain of thought, and then outputs actions. Different papers explore how long the chain should be, how to keep reasoning and action consistent, and whether to generate actions as text, dedicated action tokens, or through flow matching.

At a high level, compared with a fast-slow system, VLA integrates the MLLM world model and the planner into one autoregressive framework. This is friendlier to both imitation-learning and reinforcement-learning stages. A common explanation is that VLA brings in general knowledge of the world, mainly from internet text and reinforcement learning from human feedback. That is consistent with the intuition behind the first two paths.

But there is another way to look at it. A conventional end-to-end planner learns a mapping from vision to action, with supervision at the output: the action. We do not directly supervise how the mapping happens. VLA provides a possible answer. The reasoning chain can serve as a textual proxy for the path from vision to action, and annotators can label that path with text describing causal relationships. Next-token training then asks the autoregressive model to follow that path from vision to action. In this view, VLA pays attention not only to the final answer but also to how V reaches A and whether L and A agree.

{% include blog_figure.html image="11" alt="Path 3: a VLA maps vision and language to action through an autoregressive reasoning chain." %}

## Path 4: Dense supervision for an end-to-end planner

If you agree that end-to-end planning is a world model, you are not just training a planner; you are training a world model. Does that sound more exciting?

If so, the loss need not supervise only actions or trajectories. It can also supervise future video or latent states. The future is multimodal, but end-to-end planners face the same issue. Generative methods such as flow matching and diffusion may help address it.

{% include blog_figure.html image="12" alt="Path 4: future-scene prediction provides dense supervision alongside an action or trajectory loss." %}

## Path 5: Is imagination harder than planning?

Many recent works first imagine a future video, such as a video in which the robot successfully picks up a banana, and then use inverse kinematics, itself implemented as a network, to obtain actions. This gives us a visual chain of thought, as in path 3, and dense supervision, as in path 4. It can also bring in the general world knowledge discussed in path 1. But this approach raises two concerns:

1. We have seen what GPT-like LLMs can do, so language reasoning seems plausible. Is imagining video before acting a roundabout way to solve the task?
2. Will errors in the imagined video propagate into the actions?

The second concern also applies to VLA: errors in a reasoning chain can propagate to actions. One response is to train the model well enough. That leaves the first question: can we actually train a video world model that helps planning? I think we have to try it to find out.

First, if humans are our most capable example of intelligence, is it easier for a person to imagine an image or to specify coordinates for a trajectory? Before acting, do we not usually imagine a scene rather than the action's x, y, and z coordinates?

Second, does an error in imagination always affect the action? At least some errors may not. An incorrect background may have little effect, and people do not deliberately imagine every background detail when planning. Instead of worrying in the abstract, we can run rigorous, standardized experiments to see whether imagination helps planning. We can also use a VLM to identify incorrectly imagined clips and examine the relationship between imagination quality and planning quality.

Some papers already report that video imagination helps in their experiments. The next step may be scaling those experiments to datasets for practical applications. Overall, I am optimistic about this direction. Perhaps the model will not need to imagine every pixel, and its prediction objective should be related to planning, but I expect imagination itself to be useful. Maybe once more powerful video models such as a hypothetical Seedance 3 arrive, people will worry less.

There is no settled answer on whether language or video is the better world model. Both need to be tested. Language is an abstract, symbolic description of the world: concise and information-dense. Video is a concrete, pixel-level description that records continuous changes in visual signals. This distinction is the starting point for their differences. Some people argue that language is enough and video contains too many useless pixels. I do not know which is better, but I can argue the other side:

- **Information lost in abstraction.** Can a language description cover every change in the world that matters for planning? Compression may discard subtle but important environmental changes or action details. Video retains the original pixels and, in principle, more of that information.
- **What counts as irrelevant?** A roadside tree may look like background, yet it can suggest terrain, climate, or the presence of a nearby city. A video model can learn which visual information matters instead of relying entirely on our assumptions in advance.
- **Annotation.** Language models often need large amounts of high-quality text closely tied to actions. Human annotation is difficult to scale and keep accurate. Video naturally records actions and can yield many samples through automated processing such as cropping.
- **Connection to action.** Language can be imprecise about fine, continuous physical motion. The instruction “stop,” for example, does not specify a robot's detailed braking sequence. Continuous pixel changes are more directly tied to physical motion and may avoid part of that semantic gap.

{% include blog_figure.html image="13" alt="Path 5: a world model imagines a visual goal or trajectory, then an inverse dynamics model predicts actions." %}

## Path 6: A world model as your Doctor Strange

This path is like Doctor Strange: you propose a thousand ways to defeat Thanos, and the world model tells you which one might succeed.

The model can imagine future video, point-cloud motion, or latent-state changes. We can then score each decision using explicit criteria, such as whether there is a collision, whether the result resembles a goal image, or whether an object has been picked up. We can also use a learned evaluator, such as a VLM judging whether the imagined video achieves the goal. The resulting reward can be used to adjust the decision generator. Repeat the process to search for a better decision.

{% include blog_figure.html image="14" alt="Path 6: sample actions, roll out possible futures, evaluate them, and select an action." %}

## Path 7: Closed-loop simulation

The last path, a familiar one, is to use a world model for closed-loop simulation.

For imitation learning, it matters that training and test distributions match. But asking expert drivers to collect every possible situation would be prohibitively expensive. A more scalable approach is to create situations in a world-model simulator. For example, perturb an existing training scene so that the vehicle drifts away from the lane center, then use a data-driven or rule-based planner to generate a feasible recovery trajectory. This gives us a way to augment the imitation-learning dataset.

For reinforcement learning, an ideal world model can simulate the observations a planner would receive after different actions, including how surrounding vehicles interact with the ego vehicle. This can help construct more realistic rewards and explore a larger decision space.

{% include blog_figure.html image="15" alt="Path 7: closed-loop world-model simulation supports imitation learning and reinforcement learning." %}

The blog post [Towards Video World Models](https://www.xunhuang.me/blogs/world_model.html) discusses what makes a good world-model simulator. It helped me a great deal and inspired me to write this post. Thank you to its author.

## Why world models matter

That covers the seven paths. To me, there are two practical reasons world models matter: they can require fewer annotations and thus make training data easier to scale, and dense supervision lets us make more use of each training example. In that sense, the rise of world models is a compelling answer to the bitter lesson.

I still feel a little uneasy when starting a new research direction. Before working on an idea, I wonder whether anyone will care about it when it is finished. These seven paths are enough to convince me to explore this area, at least. With graduation approaching, perhaps it is time for one more bet.

{% include blog_figure.html image="16" alt="Summary of the seven paths from world models to robot planning." %}

One last thought: a world model models how the world evolves, building a map of the world and estimating the next state. SLAM builds a map and estimates state too. So world models are actually SLAM!

</article>
