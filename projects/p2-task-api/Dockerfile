

# ---------- 构建阶段：装依赖 ----------
#  Docker官方 node.js镜像标签
FROM node:24-alpine AS builder 
# 在容器/镜像内部根目录下的/app文件下
WORKDIR /app
#复制 package.json 和 pnpm-lock.yaml 文件到当前目录（app）下
COPY package.json pnpm-lock.yaml ./
#让pnpm可用+安装计划需要的依赖
RUN corepack enable && pnpm install --frozen-lockfile


#--------- 运行阶段：只带运行需要的东西 ----------

FROM node:24-alpine  AS runner
WORKDIR /app
#设置环境变量 NODE_ENV 为production 定义生产环境，development为开发模式
ENV NODE_ENV=production
#从build这个阶段里拿 源->目录 /app/node_modules ->  ./node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
COPY db ./db
#chown -R 用户:组 路径 改变所有者 -R递归，目录下的所有内容都改   mkdir -p /app/data创造目录 -p 父目录不存在时一起创造
RUN mkdir -p /app/data && chown -R node:node /app/data
#USER 运行身份 从这行开始 都已这个node身份运行而不是默认的root（权限小，安全）
USER node
#声明会监听 3000端口
EXPOSE 3000
#容器启动时默认执行node src/server.js RUN构造镜像时执行 CMD容器启动时候执行
CMD ["node","src/server.js"]
