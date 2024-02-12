import fs from 'fs/promises';
import path from 'path';
import mime from 'mime';
import { NextResponse, type NextRequest } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { filename: string[] } }) {
  const filename = params.filename.join('/');
  const filePath = path.join(
    process.cwd(),
    "public",
    filename
  );

  try {
    let content:  Buffer | string = await fs.readFile(filePath);
    const contentType = mime.getType(filePath) || 'application/octet-stream';
    
    // Check if the content type is text-based, then adjust encoding
    if (contentType.startsWith('text/') || contentType === 'application/json') {
      content = content.toString('utf8');
    }
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType
      }
    });
  } catch (err) {
    console.error("Error read file:", err);
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }
}
