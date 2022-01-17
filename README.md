# mobile-touchpad
touch your phone into a touchpad

# License
MIT License

Copyright (c) 2022 huoyijie (https://huoyijie.cn)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

# 如何把手机触摸屏变成触控板（Touchpad）

鼠标作为电脑的输入设备历史悠久，和键盘一起作为电脑输入的基石，使用简单直观，掌握起来也很容易，学习电脑就必然要学习如何使用鼠标。然而，当前市场中主流的笔记本电脑几乎都会配备触控板，通过简单的手势操作，可以完全取代鼠标。现在，越来越多的人正在放弃使用传统鼠标，因为鼠标移动起来需要比较大的平面空间，还需要鼠标垫，使用限制比较大，而且使用时间长了，手腕会比较累。触控板克服了这些缺陷，除了要记住一些常用的操作手势，使用起来非常方便。

笔者的台式电脑一直以来采用的是无线鼠标键盘，有时会接投影仪投屏，通过鼠标操作多有不便，市场上的触控板也是不便宜的。相信大家手里一定都有闲置的手机，而手机的触摸屏和触控板的手势操作是非常相似的，笔者想通过一个有趣的项目，把触屏手机变成一个触控板。

想要实现手机触控远程操作电脑鼠标，需要解决3个最重要的问题:

## 1. 识别手机触控手势

浏览器已有手势操作相关标准，基于 Web 天然跨平台的优势，采用浏览器来识别手势也是很自然的事情，而且有现成的开源库 [hammer.js](https://github.com/hammerjs/hammer.js) 可以直接使用。hammer.js 可以识别各种手势以及手指与屏幕的接触点坐标。

查看 hammer.js [官方 Doc](http://hammerjs.github.io/getting-started/)，主要支持以下手势:

* Pan - 移动/拖动

通过 Hammer.Pan(options) 可以构建一个移动手势对象，后面需要把 Hammer 实例对象关联到 Dom 的某个 element 元素上面，这个 element 即支持相应的手势操作了。需要支持哪些手势，就把相应构建好的手势对象实例添加到 Hanmmer 实例对象中即可，如 Hammer.Pan。Pan 对象接受一个 options 参数对象，主要选项如下表:

| 选项 | 默认值 | 说明 |
| -- | -- | -- |
| event | pan | 事件名称，Pan 实例会触发的事件，所支持的事件列表后面给出 |
| pointers | 1 | 与屏幕接触点数量，如果移动鼠标指针，只需为 1，如果滑动滚动条，通常需要为 2 |
| threshold | 10 | 识别该手势所需最小的移动距离（单位: 像素） |
| direction | DIRECTION_ALL | 移动方向，包含上、下、左、右四个方向，滑动滚动条时很有用 |

pan: 代表下面所有的事件都需要触发

panstart: 移动开始事件

panmove: 移动中事件

panend: 移动结束事件

pancancel: 移动取消事件

panleft: 向左移动事件

panright: 向右移动事件

panup: 向上移动事件

pandown: 向下移动事件

其中 panleft/panright 手势配合 2 个接触点可以控制滚动条左右滑动。同理，panup/pandown 手势配合 2 个接触点可以控制滚动条上下滑动。进而替代鼠标滚轮。

panstart/panmove/panend 配合 1 个接触点可以控制鼠标指针移动，如果再配合后面会提到的 press，则可以实现控制鼠标拖动。panmove 事件会实时上报接触点的绝对坐标或者相对位移，以此可以实时计算鼠标指针应该移动的方向和距离。

* Pinch - 缩放

可以通过 2 个或更多的接触点，实现手势控制缩放，本例暂时没有用到

* Press - 按压

可以识别 1 个或多个接触点的按压和释放手势，和 Tap 点击手势有所区别。上面提到了，press 配合 panstart/panmove/panend 可以实现鼠标拖动

| 选项 | 默认值 | 说明 |
| -- | -- | -- |
| event | press | 事件名称，Hammer.Press 实例会触发 |
| pointers | 1 | 与屏幕接触点数量，如拖动鼠标（按住左键移动鼠标），需为 1 |
| threshold | 9 | 按压时接触点允许移动的最大距离（单位: 像素） |
| time | 251 | 识别该手势要求保持按压状态的最短时间（单位: 毫秒） |

press: 按压事件
pressup: 释放事件

* Rotate - 旋转

可以通过 2 个或更多的接触点，实现手势控制旋转，本例暂时没有用到

* Swipe - 快速滑动

可以通过 1 个或多个接触点的快速移动，实现手势控制翻页、切换 Tab 标签页等，本例暂时没有用到

* Tap - 点击

可以通过 1 个接触点，实现鼠标左键单击、双击、甚至三连击等，也可以通过 2 个接触点点击模拟鼠标右键点击。

| 选项 | 默认值 | 说明 |
| -- | -- | -- |
| event | tap | 事件名称 |
| pointers | 1 | 1 个接触点点击代表鼠标左键单击，2 个接触点点击代表鼠标右键单击 |
| taps | 1 | 识别该手势的点击次数，如果单击为 1，双击为 2 |
| interval | 300 | 多次点击被识别为同一个点击事件的最大时间间隔 (单位: 毫秒) |
| time | 250 | 点击时按压状态保持的最大时长 （单位： 毫秒） |
| threshold | 2 | 点击时所允许的接触点移动距离 （单位: 像素） |
| posThreshold | 10 | 多次单击位置的最大差距距离（单位: 像素） |

tap: 点击事件

## 2. 手机与电脑之间低时延实时通信

手机和电脑之间可以通过 WIFI 建立 TCP 连接进行通信，要求手机和电脑连接相同的 WIFI，这样彼此之间可以进行通信。可以直接通过 socket.io 开源库实现，电脑端通过 Node.js 实现服务端，手机端浏览器作为客户端。因为是内网，连接质量有所保证，注意在初始化 socket.io 服务端和客户端时，可以通过配置选项控制直接建立 websocket 连接。而且 socket.io 对断线重连有非常好的支持，意外断开连接，或者重启服务端程序，甚至短时间内重启电脑，都可以自动重新连接。

虽然电脑和手机之间的数据传输量不大，但是实时性要求非常高，尤其在鼠标移动时，需要不停的计算鼠标指针的位置并不断的移动鼠标。如果数据包延时较大，鼠标的移动控制就有顿错感，体验很差。所以实际使用手机控制电脑时，要注意手机和电脑的 WIFI 信号质量、周围是否有蓝牙或者其他相同频道的干扰信号。这些干扰信号会使得通信速度下降，造成时延增加，使得鼠标出现滞后的顿错感。同理，如果路由器设备比较老了，还在用 2.4G 频率通信，如果在观看在线视频甚至游戏场景，电脑和路由器之间的数据包很多，也可能造成手机发出的触控数据包的实时性。

最理想的情况是，家里的路由器支持 5G 信号，并且信号覆盖比较理想，电脑和手机 WIFI 信号也不错，也没有其他无线干扰信号。2.4G 频段干扰信号比较多，如蓝牙、或者无线鼠标键盘等都在这个频段，很容易和 2.4G WIFI 相互之间产生信号干扰。

当然如果给台式机单独配置一个 USB 无线网卡，单独给手机来连接，进行触控数据包的实时传输，效果应该会更好，因为数据包不在经过路由器转发，手机和电脑距离又近，体验应该非常接近于无线蓝牙鼠标了。

## 3. 手势数据转换为相应的鼠标操作

现在手机产生的手势数据已经实时传输到了电脑端，现在需要调用鼠标驱动程序，对鼠标进行相应的控制。幸运的是，Node.js 端有个 [robotjs](https://github.com/octalmage/robotjs) 开源库，就像名字所暗示的，可以通过 js 实现 robot 控制电脑，让电脑可以自主操作，实现桌面自动化。可以实现一些桌面自动化测试任务，甚至实现游戏外挂。

通过 robotjs 可以控制鼠标、键盘、显示器等。下面列出了 Mouse 的主要 API:

setMouseDelay(ms): 设置鼠标时间延时（默认 10ms）

| Argument | Description | Default |
| -- | -- | -- |
| ms | 延时 (ms) | None |

moveMouse(x, y): 移动鼠标到 (x, y)

| Argument | Description | Default |
| --       | --          | --      |
| x | x 坐标 | None |
| y | y 坐标 | None |

moveMouseSmooth(x, y): 模拟人类操作，移动更平滑

| Argument | Description | Default |
| --       | --          | --      |
| x | x 坐标 | None |
| y | y 坐标 | None |

mouseClick([button], [double]): 点击鼠标

| Argument | Description | Default |
| --       | --          | --      |
| button | 接受左键 'left'，右键 'right', 中间滚轮键 'middle' | 'left' |
| double | 是否双击 | None |

mouseToggle([down], [button]): 按压鼠标

| Argument | Description | Default |
| --       | --          | --      |
| down | 按下 'down'，释放 'up' | 'down' |
| button | 接受左键 'left'，右键 'right', 中间滚轮键 'middle' | 'left' |

dragMouse(x, y): 拖动鼠标到 (x, y)

| Argument | Description | Default |
| --       | --          | --      |
| x | x 坐标 | None |
| y | y 坐标 | None |

getMousePos(): 获取当前鼠标位置

scrollMouse(x, y): 滑动滚动条

| Argument | Description | Default |
| --       | --          | --      |
| x | 负数向左滑动，正数向右滑动 | None |
| y | 负数向下滑动，正数向上滑动 | None |


getScreenSize(): 获取屏幕分辨率 (width * height)

现在所有的积木模块都已经准备好，我们要做的事情就是把积木组装起来。因为手机端基于浏览器 html5 实现，所以需要搭建一个简单的 web app，可以基于 [Koa](https://github.com/koajs/koa)，启动一个 web 服务非常简单，启动 web server 的同时初始化好 socket.io 服务。在 html 页面上引入 hammer.js 实现手势的识别，并通过 socket.io 连接把手势数据实时传输到服务端，服务端解析数据包，并通过 robotjs 驱动鼠标，实现对鼠标的控制。

在进行 socket.io 通信时可以参照[官方文档](https://socket.io/docs/v4/performance-tuning/)进行性能优化，实现最佳通信性能。同时每次通信时，只传输必要的数据，减少冗余数据，数据经过二进制序列化等都可以帮助减少数据包大小，减少数据包时延，提升操控体验。

# 作者 huoyijie (https://huoyijie.cn)
[作者更多文章](https://huoyijie.cn)