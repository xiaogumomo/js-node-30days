# p1 -cli -organizer (批量文件整理 CLI)

把一个目录里文件按扩展名分好类，**默认只打印计划、不动任何文件**

## 用法

    
    node projects/p1-cli-organizer/src/cli.js <目录>               #  <- 干跑（默认）
    node projects/p1-cli-organizer/src/cli.js <目录> --verbose     #  <- 更详细
    node projects/p1-cli-organizer/src/cli.js <目录> --target <目标目录>


**默认就是干跑** ：不加`--apply`不会移动任意文件（`--apply`还没实现）.

##  分类规则


| 分类 | 扩展名 |
| --- | --- |
|  images| .jpg .jpeg .png .gif |
|  docs  |  .pdf .docx .txt .md |
|  videos| .mp4 .mov |
|  others |  其余全部，包括没有扩展名的（如README）|


## 设计说明


-**为什么默认干跑** ：防止用户误操作，本来只是想按扩展名分类打印计划结果移动文件

-**为什么要用"扩展名->目录"的表**：减少后期维护成本，以后如需添加新的扩展名只需修改分类规则和代码中的关于此扩展名判别式的那一处即可

-**为什么用`readdir`/`stat`异步 API**因为异步不阻塞，我做过一个同步版与已异步版的计时器实验，在耗时20ms进程下，该进程进入异步的区别就让计时器从耗时21mm到2mm，得出结论：想要并行处理任务必须用异步，不然纯浪费时间


## 已知限制

-`--apply`还没实现 （Day 14 做）

-**子目录要不要递归** ： 递归

-**文件名冲突**因为只看扩展名，同名文件会遇到名字冲突的问题

-**符号链接**

-**进度显示** 无进度显示，使用者看不到究竟快要完成没有


## 目录结构

src/cli.js   命令行入口+ classify 规则
test/cli.test.js 判据（含“干跑绝不动文件”的快照对比）

    