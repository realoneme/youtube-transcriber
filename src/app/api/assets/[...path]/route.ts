import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const filePath = path.join(process.cwd(), 'assets', ...pathArray);

    // 安全检查：确保文件在assets目录内
    const assetsDir = path.join(process.cwd(), 'assets');
    const resolvedPath = path.resolve(filePath);
    const resolvedAssetsDir = path.resolve(assetsDir);

    if (!resolvedPath.startsWith(resolvedAssetsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filePath).toLowerCase();

    let contentType = 'application/octet-stream';
    switch (ext) {
      case '.mp3':
        contentType = 'audio/mpeg';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }

    // Support HTTP Range requests for seeking
    const range = request.headers.get('range') || request.headers.get('Range');
    if (range) {
      const bytesPrefix = 'bytes=';
      if (!range.startsWith(bytesPrefix)) {
        return new NextResponse('Malformed Range header', { status: 416 });
      }

      const rangeParts = range.substring(bytesPrefix.length).split('-');
      let start = parseInt(rangeParts[0], 10);
      let end = rangeParts[1] ? parseInt(rangeParts[1], 10) : fileSize - 1;

      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start > end ||
        start >= fileSize
      ) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      if (end >= fileSize) end = fileSize - 1;

      // Read and return the requested byte range
      const fullBuffer = fs.readFileSync(filePath);
      const chunk = fullBuffer.subarray(start, end + 1);

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunk.length),
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    // Fallback: return the entire file
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(fileSize),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
