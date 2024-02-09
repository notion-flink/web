import fs from "fs"
import path from "path"
import { unzip } from "fflate"

// 假设的文件处理函数，用于从ZIP中提取Markdown内容和图片
async function fetchAndUnzip(exportURL: string, outputPath: string) {
  // 下载ZIP文件
  const response = await fetch(exportURL)
  if (!response.ok) {
    throw new Error("Failed to download file")
  }

  // 获取ZIP文件的二进制数据
  const arrayBuffer = await response.arrayBuffer()
  const zipData = new Uint8Array(arrayBuffer)
  
  await fs.promises.mkdir(outputPath, { recursive: true });

  // 解压ZIP文件
  return new Promise<string>((resolve, reject) => {
    unzip(zipData, (err, unzippedFiles) => {
      if (err) {
        reject(new Error("Failed to unzip file"))
        return
      }

      // 遍历解压缩后的文件对象
      for (const filename in unzippedFiles) {
        const fileData = unzippedFiles[filename]
        const filePath = path.join(outputPath, filename)
        const dir = path.dirname(filePath)

        // 确保目录存在
        fs.mkdirSync(dir, { recursive: true })
        // 写入文件
        fs.writeFileSync(filePath, Buffer.from(fileData))
      }

      // 假设我们只有一个Markdown文件
      const mdFilename = Object.keys(unzippedFiles).find((name) =>
        name.endsWith(".md")
      )
      if (!mdFilename) {
        reject(new Error("Markdown file not found"))
        return
      }

      // 返回Markdown文件的URL路径
      resolve(mdFilename)
    })
  })
}

export { fetchAndUnzip }
