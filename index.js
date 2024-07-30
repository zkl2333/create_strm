const fs = require("fs");
const path = require("path");

// 从环境变量中获取参数
const strmMode = process.env.STRM_MODE || "remote"; // 'local' | 'remote'
const sourcePath = path.resolve(process.env.SOURCE_PATH || "\\\\Nas001\\共享文件\\影音\\XXX");
const remoteUrl = process.env.REMOTE_URL || "http://192.168.31.32:8998/媒体库/XXX/";
const targetPath = path.resolve(process.env.TARGET_PATH || "\\\\Nas001\\共享文件\\影音\\xxxStrm");
const overwrite = process.env.OVERWRITE === "true"; // true | false

// 支持的媒体文件扩展名
const mediaExtensions = [".mp4", ".mkv", ".avi", ".mov", ".flv", ".wmv", ".rmvb", ".webm"];

// 计算目录中所有文件的数量
const countFiles = (dir) => {
  let fileCount = 0;
  const walk = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        walk(filePath);
      } else {
        fileCount++;
      }
    });
  };
  walk(dir);
  return fileCount;
};

// 遍历目录并执行回调函数
const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, callback);
    } else {
      callback(filePath);
    }
  });
};

// 媒体文件创建 strm 文件，非媒体文件复制
const createStrm = (dir, totalFiles) => {
  let processedFiles = 0;
  walk(dir, (filePath) => {
    const ext = path.extname(filePath);
    const relativePath = path.relative(sourcePath, filePath);
    const targetFilePath = path.join(targetPath, relativePath);
    const targetFileDir = path.dirname(targetFilePath);

    if (mediaExtensions.includes(ext)) {
        const strmFilePath = targetFilePath.replace(ext, ".strm");
        const strmFileDir = path.dirname(strmFilePath);

      if (!fs.existsSync(strmFileDir)) {
        fs.mkdirSync(strmFileDir, { recursive: true });
        console.log(`Created directory: ${strmFileDir}`);
      }

      if (!fs.existsSync(strmFilePath) || overwrite) {
        if (strmMode === "local") {
          fs.writeFileSync(strmFilePath, filePath);
        } else {
          // 构建 URL 路径，确保使用正斜杠
          const urlPath = `${remoteUrl}${relativePath.replace(/\\/g, "/")}`;
          fs.writeFileSync(strmFilePath, urlPath);
        }
        console.log(`Created strm file: ${strmFilePath}`);
      }
    } else {
      if (!fs.existsSync(targetFileDir)) {
        fs.mkdirSync(targetFileDir, { recursive: true });
        console.log(`Created directory: ${targetFileDir}`);
      }

      if (!fs.existsSync(targetFilePath) || overwrite) {
        if (fs.existsSync(targetFilePath)) {
          fs.unlinkSync(targetFilePath);
        }
        fs.copyFileSync(filePath, targetFilePath);
        console.log(`Copied ${filePath} to ${targetFilePath}`);
      }
    }

    // 更新并显示进度
    processedFiles++;
    const progress = ((processedFiles / totalFiles) * 100).toFixed(2);
    console.log(`Progress: ${progress}% (${processedFiles}/${totalFiles} files)`);
  });
};

// 如果目标路径不存在，则创建目标路径
if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath, { recursive: true });
  console.log(`Created target directory: ${targetPath}`);
}

// 计算总文件数并开始创建 strm 文件
const totalFiles = countFiles(sourcePath);
console.log(`Total files to process: ${totalFiles}`);
createStrm(sourcePath, totalFiles);
