import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { AddBalanceDto } from '../common/dto/add-balance.dto';
import { CreateStockDto } from '../common/dto/create-stock.dto';
import { BlockUserDto } from '../common/dto/block-user.dto';
import { CreateServiceDto } from '../common/dto/create-service.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Post('add-balance')
  async addBalance(@Body() body: AddBalanceDto) {
    return this.adminService.addBalance(body.telegramId, body.amount);
  }

  @Post('block-user')
  async blockUser(@Body() body: BlockUserDto) {
    return this.adminService.toggleBlockUser(body.telegramId);
  }

  @Post('create-account')
  async createAccount(@Body() body: CreateStockDto) {
    return this.adminService.createStock(body.serviceId, body.email, body.password, body.pin, body.profiles, body.profilePins);
  }

  @Get('stock')
  async getStockSummary() {
    return this.adminService.getStockSummary();
  }

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('services')
  async getServices() {
    return this.adminService.getServices();
  }

  @Post('services')
  async createService(@Body() body: CreateServiceDto) {
    return this.adminService.createService(body.name, body.price);
  }

  @Put('services/:id')
  async updateService(
    @Param('id') id: string,
    @Body() body: { price?: number; active?: boolean },
  ) {
    return this.adminService.updateService(Number(id), body);
  }

  @Delete('services/:id')
  async deleteService(@Param('id') id: string) {
    return this.adminService.deleteService(Number(id));
  }

  @Get('transactions')
  async getTransactions() {
    return this.adminService.getTransactions();
  }

  @Get('users/:id/purchases')
  async getUserPurchases(@Param('id') id: string) {
    return this.adminService.getUserPurchases(Number(id));
  }

  @Post('set-password')
  async setPassword(@Body() body: { telegramId: string; password: string }, @Req() req: any) {
    return this.adminService.setPassword(body.telegramId, body.password, req.user.userId);
  }
}
