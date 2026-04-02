---
layout: barron
title: ""
permalink: /
author_profile: false
redirect_from:
  - /about/
  - /about.html
---

<table class="barron-intro">
  <tbody>
    <tr>
      <td class="fei-intro-text">
        <p class="fei-intro-name">
          <name>{{ site.author.name }}</name>
        </p>
        <p>
          I am a Ph.D. candidate at the <a href="https://uav.hkust.edu.hk/">Aerial Robotics Group</a> at HKUST, advised by Prof. <a href="https://scholar.google.com.hk/citations?user=u8Q0_xsAAAAJ&amp;hl=zh-CN&amp;oi=ao">Shaojie Shen</a>.
          Before that, I received my Master's degree from the <a href="http://irmv.sjtu.edu.cn/">IRMV Lab</a> at Shanghai Jiao Tong University, supervised by Prof. <a href="http://irmv.sjtu.edu.cn/wanghesheng">Hesheng Wang</a>.
        </p>
        <p>
          My research interests lie in robotics and autonomous driving, with a focus on world models for autonomous driving, robust estimation, global localization, and long-term mapping.
        </p>
        <p class="fei-intro-links">
          <a href="mailto:{{ site.author.email }}">Email</a>
          <span class="barron-link-sep">|</span>
          <a href="{{ site.author.googlescholar }}">Google Scholar</a>
          <span class="barron-link-sep">|</span>
          <a href="https://github.com/{{ site.author.github }}">GitHub</a>
          {% if site.author.zhihu %}<span class="barron-link-sep">|</span><a href="{{ site.author.zhihu }}">Zhihu</a>{% endif %}
        </p>
      </td>
      <td class="fei-intro-photo">
        <a href="{{ site.author.avatar | relative_url }}"><img class="hoverZoomLink" src="{{ site.author.avatar | relative_url }}" alt="{{ site.author.name }}" loading="lazy"></a>
      </td>
    </tr>
  </tbody>
</table>

## Publications

<div class="barron-pubs" markdown="0">
{% include barron_publications.html %}
</div>

## Education

- Ph.D., Hong Kong University of Science and Technology, 2022 – Present  
  Department of Electronic and Computer Engineering
- M.S. Control Engineering, Shanghai Jiao Tong University, 2019 – 2022  
  Department of Automation, School of Electronics, Information and Electrical Engineering
- B.S. Automation, Northeastern University (China), 2015 – 2019  
  Department of Automation, College of Information Science and Engineering

## Selected honors

- **Outstanding Graduates**, 2022, SJTU
- **Most Influential Graduates**, 2019, NEU
- **Champion**, the 17th China University Robot Competition, 2018 <a href="http://www.cnrobocon.net/#/">[link]</a>
- **Runner-up**, The ABU Asia-Pacific Robot Contest, 2018 <a href="https://en.wikipedia.org/wiki/ABU_Robocon">[link]</a>
- **Champion**, the 16th China University Robot Competition, 2017 <a href="http://www.cnrobocon.net/#/">[link]</a>
- **Best Engineering**, The ABU Asia-Pacific Robot Contest, 2017 <a href="http://www.aburobocon.net/">[link]</a>

## Community services

- Conference reviewer: ICRA, IROS, CVPR, ICCV, ECCV
- Journal reviewer: T-RO, T-ASE, RAL
- Teaching assistant:
  - ELEC 1100: Introduction to Electro-Robot Design, HKUST, 2023 Spring
  - ELEC 3210: Machine Learning and Information Processing for Robotics, HKUST, 2023 Fall

## Visitors

<div class="barron-visitor-map" markdown="0">
{% include visitor_map.html %}
</div>
