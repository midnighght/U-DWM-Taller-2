import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Add this import
import { DatabaseModule } from './database/database.module';
import { MonstersModule } from './monsters/monsters.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Add this line
    DatabaseModule, 
    MonstersModule,
  ],
})
export class AppModule {}
