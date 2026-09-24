import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class UpdateTaxSettingDto {
  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsBoolean()
  @IsOptional()
  vatEnabled?: boolean;

  @IsNumber()
  @IsOptional()
  defaultTaxRate?: number;

  @IsString()
  @IsOptional()
  fiscalYearStart?: string;
}
