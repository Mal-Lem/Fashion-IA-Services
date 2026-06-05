import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DesignsService } from './designs.service';
import { GenerateDesignDto } from './dto/generate-design.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('designs')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('designs')
export class DesignsController {
  constructor(private designsService: DesignsService) {}

  @ApiOperation({ summary: 'Generer 4 designs IA' })
  @ApiResponse({ status: 201, description: 'Designs generes' })
  @ApiResponse({ status: 402, description: 'Quota depasse' })
  @Post('generate')
  async generate(@Req() req: Request, @Body() dto: GenerateDesignDto) {
    return this.designsService.generate(req.user['id'], dto);
  }

  @ApiOperation({ summary: 'Lister mes designs sauvegardes' })
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.designsService.findAll(req.user['id'], +page, +limit);
  }

  @ApiOperation({ summary: "Detail d'un design" })
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    return this.designsService.findOne(id, req.user['id']);
  }

  @ApiOperation({ summary: 'Modifier un design' })
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: Request, @Body() data: any) {
    return this.designsService.update(id, req.user['id'], data);
  }

  @ApiOperation({ summary: "Selectionner une image du design" })
  @Post(':id/select')
  async select(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('selectedImageUrl') selectedImageUrl: string,
  ) {
    return this.designsService.select(id, req.user['id'], selectedImageUrl);
  }

  @ApiOperation({ summary: 'Supprimer un design' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.designsService.remove(id, req.user['id']);
  }
}