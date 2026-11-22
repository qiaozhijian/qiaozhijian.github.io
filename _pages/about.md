---
layout: barron
title: ""
permalink: /
author_profile: false
show_visitor_map: true
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
          <span class="fei-intro-name-note">
            {% if site.author.name_ipa %}<span class="fei-intro-ipa" title="Pronunciation (IPA)">{{ site.author.name_ipa }}</span>{% endif %}
            <span class="fei-intro-callme">My name can be tricky to pronounce. You can call me George.</span>
          </span>
        </p>
        <p>
          I am a Ph.D. candidate in Electronic and Computer Engineering at the <a href="https://uav.hkust.edu.hk/">Aerial Robotics Group</a> at HKUST, advised by Prof. <a href="https://scholar.google.com.hk/citations?user=u8Q0_xsAAAAJ&amp;hl=zh-CN&amp;oi=ao">Shaojie Shen</a>.
          Before that, I received my Master's degree from the <a href="http://irmv.sjtu.edu.cn/">IRMV Lab</a> at Shanghai Jiao Tong University, supervised by Prof. <a href="http://irmv.sjtu.edu.cn/wanghesheng">Hesheng Wang</a>.
        </p>
        <p>
          My research focuses on action-conditioned physical world models, generative crowdsourced semantic mapping, and LiDAR/vision registration and localization. I study how geometry and generative models can help robots understand the physical world. My broader goal is to build environments in which robots can learn intelligent behavior through interaction.
        </p>
        <p class="fei-intro-links">
          <a href="mailto:{{ site.author.email }}">Email</a>
          <a href="{{ site.author.googlescholar }}"><i class="fa-brands fa-google-scholar fei-intro-link-icon" aria-hidden="true"></i>Google Scholar</a>
          <a href="https://github.com/{{ site.author.github }}"><i class="fa-brands fa-github fei-intro-link-icon" aria-hidden="true"></i>GitHub</a>
          {% if site.author.zhihu %}<a href="{{ site.author.zhihu }}"><i class="fa-brands fa-zhihu fei-intro-link-icon" aria-hidden="true"></i>知乎</a>{% endif %}
        </p>
      </td>
      <td class="fei-intro-photo">
        <a href="{{ site.author.avatar | relative_url }}"><img class="hoverZoomLink" src="{{ site.author.avatar | relative_url }}" alt="{{ site.author.name }}" loading="lazy"></a>
      </td>
    </tr>
  </tbody>
</table>

## Blog

<p class="barron-section-intro">Notes on robotics, computer vision, and world models.</p>

{% include blog_cards.html limit=3 %}

<p class="blog-all"><a href="{{ '/blog/' | relative_url }}">View all posts</a></p>

## Publications

<div id="publication-list" class="barron-pubs" markdown="0">
{% include barron_publications.html %}
</div>

## Industry Experience
{: #experience }

<ul class="barron-timeline">
  <li><span class="timeline-date">2024 – Present</span><span>Research Intern, <strong>Zhuoyu Technology</strong> · Shenzhen</span></li>
  <li><span class="timeline-date">2021</span><span>Semi-supervised 3D Detection Intern, <strong>SenseTime</strong> · Shanghai</span></li>
</ul>

## Education

- Ph.D., Hong Kong University of Science and Technology, 2022 – Present  
  Department of Electronic and Computer Engineering
- M.S. Control Engineering, Shanghai Jiao Tong University, 2019 – 2022  
  Department of Automation, School of Electronics, Information and Electrical Engineering
- B.S. Automation, Northeastern University (China), 2015 – 2019  
  Department of Automation, College of Information Science and Engineering

## Selected honors
{: #awards }

- **Outstanding Graduates**, 2022, SJTU
- **Most Influential Graduates**, 2019, NEU
- **Champion**, the 17th China University Robot Competition, 2018 <a href="http://www.cnrobocon.net/#/">[link]</a>
- **Runner-up**, The ABU Asia-Pacific Robot Contest, 2018 <a href="https://en.wikipedia.org/wiki/ABU_Robocon">[link]</a>
- **Champion**, the 16th China University Robot Competition, 2017 <a href="http://www.cnrobocon.net/#/">[link]</a>
- **Best Engineering**, The ABU Asia-Pacific Robot Contest, 2017 <a href="http://www.aburobocon.net/">[link]</a>

## Community services

- Conference reviewer: ICRA, IROS, CVPR, ICCV, ECCV
- Journal reviewer: IJRR, T-RO, T-ASE, RAL

## Teaching

<ul class="barron-timeline">
  <li><span class="timeline-date">Fall 2023</span><span>ELEC 3210: Machine Learning and Information Processing for Robotics · HKUST · Teaching Assistant</span></li>
  <li><span class="timeline-date">Spring 2023</span><span>ELEC 1100: Introduction to Electro-Robot Design · HKUST · Teaching Assistant</span></li>
</ul>
