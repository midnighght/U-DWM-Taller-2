import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule,
			MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
				useFactory: (config: ConfigService) => {
				const uri = config.get<string>('DATABASE_URL');
				if (!uri) throw new Error('DATABASE_URL not defined');
				const dbName = config.get<string>('DATABASE_NAME');
				return {
					uri,
					dbName: dbName || undefined,
					autoIndex: true,
				};
			},
		}),
	],
	exports: [MongooseModule],
})
export class DatabaseModule {}
