# 使用官方的 Node.js 镜像作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 复制当前目录下的所有文件到工作目录
COPY index.js /app

# 运行脚本
CMD ["node", "index.js"]
