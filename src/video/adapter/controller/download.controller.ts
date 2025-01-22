import { Controller, Get, HttpException, HttpStatus, Logger, Param, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('download')
export class DownloadController {
  
  @Get(':id')
  downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    
    res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${id}.zip"`,
      });

    const file = fs.createReadStream(path.resolve(process.env.PATH_DOWNLOAD, id + '.zip'));
    return new StreamableFile(file);
  }
}
