import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { NextResponse, type NextRequest } from "next/server"

export function GET(req: NextRequest,{ params }: { params: { filename: string } }) {
  const { filename } = params;
  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    filename
  )
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      return NextResponse.json({ message: "File not found" }, { status: 404 })
    }
    const contentType = mime.getType(filePath) || 'application/octet-stream';
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType
      }
   });
  });
}