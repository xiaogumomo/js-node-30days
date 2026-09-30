# p1-cli -organizer (批量文件整理 CLI)

把一个目录里文件按扩展名分好类，**默认只打印计划、不动任何文件**

## 用法

    
    node projects/p1-cli-organizer/src/cli.js <目录>               #  <- 干跑（默认）
    node projects/p1-cli-organizer/src/cli.js <目录> --verbose     #  <- 更详细
    node projects/p1-cli-organizer/src/cli.js <目录> --target <目标目录>
    node projects/p1-cli-organizer/src/cli.js  <目录> --apply [--target <目标>] [--verbose]   


**默认就是干跑** ：不加 --apply 一个文件都不动

**--apply**  ：  四步顺序（mkdir → 流式复制 → 校验 size+sha256 → 通过才删源）,默认目标目录就是源目录。

##  分类规则


| 分类 | 扩展名 |
| --- | --- |
|  images| .jpg .jpeg .png .gif |
|  docs  |  .pdf .docx .txt .md |
|  videos| .mp4 .mov |
|  others |  其余全部，包括没有扩展名的（如README）|


## 设计说明


-**为什么默认干跑** ：防止用户误操作，用户可能只是想看一眼计划，误加 --apply 就会真动文件，所以默认干跑让'动'必须显式要求

-**为什么要用"扩展名->目录"的表**：减少后期维护成本，以后如需添加新的扩展名只需修改分类规则和代码中的关于此扩展名判别式的那一处即可

-**为什么用`readdir`/`stat`异步 API**：因为异步不阻塞，我做过一个同步版与已异步版的计时器实验，在耗时20ms进程下，该进程进入异步的区别就让计时器从耗时21mm到2mm，得出结论：想要并行处理任务必须用异步，不然纯浪费时间

**如果遇到两个子目录里同名的改怎么办** ：改名(photo.jpg → photo(1).jpg),保证不覆盖不丢。因为覆盖会导致数据流失，本来需要的文件结果因为覆盖而找不到是用户不能接受的。
**这种改同名的代价是什么** ：①原本的文件找不到了，比如要找photo.jpg结果搜出来的是另一个文件。
②搬完之后你看到photo.jpg和photo(1).jpg你没法从名字看出哪个是你搬出来的
③photo(1).jpg、photo(2).jpg…这种（）会累计，如果是数量多起来没法分辨，更难自主清理

**为什么复制要用流**：内存上压力更小，比起直接读取全部文件，一段一段消耗的内存显然更小



**为什么先校验再删源**：不丢数据，只有复制了加上校验通过后才unlink删除源目录的文件




## 已知限制


-**中断（Ctrl+C）**： Ctrl+C 中断会在目标里留半成品副本（源不丢 —— 因为删源在校验之后）

**递归** ：会递归子目录

-**符号链接**：符号链接会被静默跳过（walk） 只收 entry.isFile()；Node 文档里符号链接的 isFile() 是 false

-**进度显示**： 没有进度显示（大文件搬运时看起来像卡住）

| 场景 | 制造案例 | 实测输出（原文） | 退出码 |
| --- | --- | --- | --- |
| 源目录不存在（ENOENT） | node src/cli.js "C:/不存在的目录xyz" | 源目录读取不了C:/不存在的目录xyz(ENOENT\|\|ENOENT: no such file or directory, scandir '…') | 1 |
| 目标位置被占（EEXIST） | 目标里先放一个名为 images 的文件 | 文件出错了：photo.jpg-目标位置被同名文件占住了{"level":50,…,"err":{"type":"Error","message":"EEXIST: …","stack":"…"},"file":"photo.jpg","msg":"搬运失败"}共 1 个文件,共计搬了0个文件，失败了1个文件 | 1 |
| 无权限（EPERM） | node src/cli.js "C:/Windows/System32/config" | 源目录读取不了C:/Windows/System32/config(EPERM\|\|EPERM: operation not permitted, scandir '…') | 1 |

## 目录结构

src/cli.js   命令行入口+ classify 规则
test/cli.test.js 判据（含“干跑绝不动文件”的快照对比）
test/apply.test.js  --apply 的 9 条判据
package.json   pnpm test = node --test



## 安装、依赖说明

**安装** ： pnpm install 

**依赖说明** ：pino（结构化日志）

**只用pino的理由**：①每条依赖都是自己没读过的代码，安全性等等都有隐患
②满足本项目95％的需要，对于标准库来说绰绰有余
③pino结构化日志对于自己来写时间上精力上不划算，而且不一定保证能写完整，很可能是一份半成品
④pnpm audit 要审的树小，安装快，别人能更快的用到




## 使用示例  真实输出


**使用示例**
PS C:\Users\27971\.zcode\workspace\default\js-node-30days> cd 'C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p1-cli-organizer'

PS C:\Users\27971\.zcode\workspace\default\js-node-30days\projects\p1-cli-organizer> node src/cli.js ../../week2-runtime/README示例文件-发送文件 --apply --target ../../week2-runtime/README示例文件-目标文件 --verbose

**真实输出**

{"level":30,"time":1790754722479,"file":"big1.ndjson","category":"others","msg":"鎼繍鎴愬姛"}
{"level":30,"time":1790754722546,"file":"big2.ndjson","category":"others","msg":"鎼繍鎴愬姛"}
{"level":30,"time":1790754722607,"file":"big3.ndjson","category":"others","msg":"鎼繍鎴愬姛"}
{"level":30,"time":1790754722673,"file":"big4.ndjson","category":"others","msg":"鎼繍鎴愬姛"}
共 4 个文件,共计搬了4个文件，失败了0个文件
目标目录：../../week2-runtime/README示例文件-目标文件
  计划：big1.ndjson → others/  （..\..\week2-runtime\README示例文件-发送文件\big1.ndjson）
  计划：big2.ndjson → others/  （..\..\week2-runtime\README示例文件-发送文件\big2.ndjson）
  计划：big3.ndjson → others/  （..\..\week2-runtime\README示例文件-发送文件\big3.ndjson）
  计划：big4.ndjson → others/  （..\..\week2-runtime\README示例文件-发送文件\big4.ndjson）
共 4 个文件：images 0、docs 0、videos 0、others 4

