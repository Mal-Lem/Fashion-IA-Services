import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouturieresService } from './couturieres.service';
import { CreateCouturiereProfileDto, UpdateCouturiereProfileDto, SearchCouturieresDto } from './dto/couturiere.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('couturieres')
@Controller('couturieres')
export class CouturieresController {
  constructor(private couturieresService: CouturieresService) {}

  @ApiOperation({ summary: 'Rechercher des couturieres avec scoring ML' })
  @Get()
  async search(@Query() query: SearchCouturieresDto, @Req() req: Request) {
    const userId = req.user?.['id'];
    return this.couturieresService.search(query, userId);
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Mon profil couturiere' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Req() req: Request) {
    return this.couturieresService.getMyProfile(req.user['id']);
  }

  @ApiOperation({ summary: "Profil public d'une couturiere" })
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.['id'];
    return this.couturieresService.findOne(id, userId);
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Creer mon profil couturiere' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProfile(@Req() req: Request, @Body() dto: CreateCouturiereProfileDto) {
    return this.couturieresService.createProfile(req.user['id'], dto);
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Mettre a jour mon profil' })
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateCouturiereProfileDto) {
    return this.couturieresService.updateProfile(req.user['id'], dto);
  }
  
}