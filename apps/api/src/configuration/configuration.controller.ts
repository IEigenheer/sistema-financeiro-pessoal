import { Body, Controller, Get, Put } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get()
  getSettings() {
    return this.configurationService.getSettings();
  }

  @Put()
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.configurationService.updateSettings(dto);
  }
}
