import { Controller, Get, Param, Post, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import * as multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Video } from '../../core/domain/Video';

import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { IVideoService } from 'src/video/core/application/services/video.service.port';
import { JwtAuthGuard } from 'src/video/adapter/controller/jwt-auth.guard';

@Controller('video')
@UseGuards(JwtAuthGuard)
export class VideoController {

  constructor(private readonly videoService: IVideoService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo para upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, `${process.env.PATH_PROCESSAR}`);
        },
        filename: (req, file, cb) => {
          cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<Video> {
    return this.videoService.processarArquivo(file);
  }

  @Get('download/:id')
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
