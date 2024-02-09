import { promises as fs } from "fs"
import path from "path"
import { unzip } from "fflate"

// 将 fflate 的 unzip 方法转换为可以使用 Promise 的函数
const asyncUnzip = (
  input: Uint8Array
): Promise<{ [filename: string]: Uint8Array }> => {
  return new Promise((resolve, reject) => {
    unzip(input, (error, unzipped) => {
      if (error) return reject(error)
      resolve(unzipped)
    })
  })
}

export async function saveFilesFromZip(
  buffer: Uint8Array,
  outputPath: string
): Promise<string> {
  // 确保输出路径存在
  await fs.mkdir(outputPath, { recursive: true })

  // 解压缩 Buffer
  const unzipped = await asyncUnzip(buffer)

  let mdFilePath: string | undefined

  for (const filename in unzipped) {
    const fileContent = unzipped[filename]
    const filePath = path.join(outputPath, filename)

    // 确保文件路径中的目录存在
    const directoryPath = path.dirname(filePath)
    await fs.mkdir(directoryPath, { recursive: true })

    if (filename.endsWith(".md")) {
      // 如果是 Markdown 文件，记录其路径
      mdFilePath = filePath
    }

    // 保存文件到磁盘
    await fs.writeFile(filePath, fileContent)
  }

  if (!mdFilePath) {
    throw new Error("Markdown file not found in the ZIP archive")
  }

  // 获取当前工作目录
  const currentWorkingDir = process.cwd()
  // 生成相对于当前工作目录的路径
  const relativePath = path.relative(currentWorkingDir, mdFilePath)

  // 返回 Markdown 文件的相对路径
  return relativePath.replace(/^public\//, "")
}
