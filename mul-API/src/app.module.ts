import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Add this import
import { DatabaseModule } from './database/database.module';
import { SpellsModule } from './spells/spells.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Add this line
    DatabaseModule, 
    SpellsModule,
  ],
})
export class AppModule {}
