# <img src="https://github.com/hpa-antren/scrum-portal/blob/master/public/img/icon_agile.png?raw=true" width=48> Scrum Portal (基于JIRA的Scrum Process系统模板)

## 1. Background
需求来源于HPA团队本身，由于HPA使用JIRA Cloud管理项目，从需求承接、形成User Story、到开启迭代、拆分Dev Task、到迭代完成DevOps发布， 全程都在JIRA上完成。但团队在实施Scrum的过程中，总结发现使用JIRA实施敏捷的两个问题：
1. 团队数据透明化：敏捷强调团队共担责任、共享视野、朝同一个方向前进，那么团队实时掌控的数据就尤为重要，包括迭代发布的规划、实时的任务进展(JIRA)、产品的线上运行情况等，JIRA仅能覆盖一部分。
2. 迭代工作量评估：通常我们使用的JIRA里的Story Point，只是一个笼统的复杂度概念，在团队初期实施敏捷没达到成熟的状态之前，具体的工作量评估是要细分到前端、后端、QA甚至移动端等多个更细维度。

## 2. Solution
基于HPA团队实施敏捷的痛点，团队内部自主研发了这个Scrum Web Portal，主要解决两个问题：
1. 信息透明、集群化（一站式浏览、一站式同步）
2. 效率工具化（打通JIRA+Confluence系统）

```diff
- 特别声明：
- 此Portal绝不是开箱即用的解决方案，它最大的目的是提供一个可复用、或二次开发、可运行演示的例子（所以叫系统模板）
- 期望通过它来形象的说明：我们理解和实践总结出来的Scrum团队需要借助哪些系统化的能力来辅助迭代推进，以及团队如何向成熟敏捷形态迈进！
```

## 3. Design
目前Scrum Web Portal设计了四个模块：
1. Sprint Center: 设计了一个Sprint内评估迭代工作量的计算器，更细粒度的评估Scrum Team的迭代产能以及工作量负荷
2. Release Center: 通过一个发布日历，清晰的展示的迭代中团队的发布计划、发布类型、以及发布的状态
3. Product Center: 实时的监控Live环境，部署运行了多少应用，每个应用的健康状况，基础信息等
4. JIRA Toolbox: 实时抓去、同步JIRA各个Scrum Board数据，用于团队统计迭代的各项指标，评估迭代的成效

## 4. Demo Data
所有演示数据都存放于 /example 目录下，仅供效果演示，实际生产中，可按照 /example下的数据结构向前端返回真实数据即可.
**由于所有数据都只用于演示，运行无需安装Database或者其他SDK，只需要有NodeJS环境，version > 8.0即可。**

### 4.1 Sprint Center 演示原理: 
计算器会以总人天（2周1迭代人均10人天）、剔除：团队会议时间 Meeting Days（单位：人天）、个体成员请假时间 Leave Days（单位：人天）、个体成员预留时间 Buffer Days（单位：人天），得到团队总体产能Capacity，对比团队评估的Sprint交付资源消耗情况，向团队实时的展示迭代团队工作量。

1. 最上方指定JIRA面板的Sprint名称，以及JIRA Project Key
2. 10：代表默认2周1个迭代，人均可用的总人天数为10，
3. 1.5：代表团队给自己身预留的会议消耗人天为1.5（指全员参与的会议，例如迭代计划会、回顾会等等）
4. Persons 行：分别填写 前端、后端、QA、移动端人数
5. Buffer Days 行：代表各角色需要给自己预留的人天数（预留是因为有迭代外的事务需要消耗人员时间，比如公司事务、私人事情）
6. Leave Days 行：代表各角色需要提前规划未来一个迭代自身的出勤能力、填写休假人天数
7. 点击[Load JIRA]按钮，加载JIRA面板对应Sprint名字下规划好的所有Story+Bug，团队成员依次对每个Story+Bug评估交付的资源消耗代价，前后端、QA移动端分别需要多少人天来完成，对应的Story Point是多少
8. 评估的过程中，随时可以点击[Calculator]按钮来观察团队的工作量Consume是否已经大于团队产能Capacity，如果大于，主要瓶颈出现在哪个角色身上
9. 最后点击[Sync JIRA]按钮，系统会自动讲评估完成（即Total>0）的任务自动同步回JIRA系统中，填写好Story Point以及Estimate Time（根据Total人天自动计算出来）
10. 已经评估过的历史Sprint，可以使用[Load History]按钮，加载出来便于回顾总结

<img src="https://github.com/hpa-antren/scrum-portal/blob/master/example/sprint-calculator.png?raw=true">

### 4.2 Release Center 演示原理: 
演示数据只准备了2019年9月份的数据采样，请翻到日历的2019年9月查看效果。

1. 两种发布状态：黑色代表规划了，但是没有完成发布，其他颜色代表已经完成了发布已上Live。
2. 所有发布分成三种类型：蓝色代表大版本发布[Prod]，绿色代表功能优化发布[Patch]，红色代表修复问题发布[Hotfix]
3. 点击日历事件可以查阅从JIRA上拉取下来的发布详情，内容和对应的人员.

<img src="https://github.com/hpa-antren/scrum-portal/blob/master/example/release-calendar.png?raw=true">

### 4.3 Product Center 演示原理：
系统展示了所有线上已发布的应用分布统计情况，向团队展示整个Live应用的全貌，按照产品名、应用类型（前端、后端、AWS Lambda等）进行多维度的统计形成一个全局Live Application Dashboard.

<img src="https://github.com/hpa-antren/scrum-portal/blob/master/example/product-list.png?raw=true">

### 4.4 JIRA Toolbox 演示原理：
Scrum Web Portal自己研发了一套打通JIRA & Confluence的接口，基于JS语言，在真实环境只要自行配置Atlassian账号的username和API Token，即可开箱即用。
关于API Token可参考官网文档获取：https://confluence.atlassian.com/cloud/api-tokens-938839638.html

接口源代码位于 /server/scrum-jira.js文件中，包含了JIRA Issue拉取、字段更新、JIRA面板的Sprint创建、管理、Confluence页面拉取、更新、创建等等接口。

JIRA Toolbox演示了从JIRA中按照Sprint名称以及面板所属的JIRA Project KEY分别拉取Story数据、Task数据以及Bug数据的效果，用于团队进行迭代回顾统计、迭代指标收集。

<img src="https://github.com/hpa-antren/scrum-portal/blob/master/example/jira-toolbox.png?raw=true">

## 5. Tech Stack
- NodeJS
- Angular
- socket.io (web socket communication between frontend & backend): https://socket.io/
- AdminLTE (Free Boostrap Admin Dashboard & Control Panel Theme): https://adminlte.io/
- JIRA Cloud Platform REST API: https://developer.atlassian.com/cloud/jira/platform/rest

## 6. Install & Start

    npm install
    node server.js

visit: http://localhost:8080
