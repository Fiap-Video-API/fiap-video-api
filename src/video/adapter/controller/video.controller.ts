import { Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any): Promise<Video> {

    try {
      return await this.videoService.registrarUpload(file, req.user?.id, req.user?.email);
    } catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('download/:id')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: any
  ): Promise<StreamableFile> {
    
    try {
      await this.videoService.registrarDownload(id, req.user?.id);
    } catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${id}.zip"`,
      });

    const file = fs.createReadStream(path.resolve(process.env.PATH_DOWNLOAD, id + '.zip'));
    return new StreamableFile(file);
  }

  @Get('status')
  async status(
    @Req() req: any
  ): Promise<Video[]> {
    
    try {
      return await this.videoService.adquirirStatusPorUsuario(req.user?.id);
    } catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('status/:id')
  async statusVideo(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<Video> {
    try {
      return await this.videoService.adquirirStatusPorVideo(id, req.user?.id);
    } catch(error){
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
