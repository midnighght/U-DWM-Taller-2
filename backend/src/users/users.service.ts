import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto, UserResponseDto } from './dto/user.dto';
import { UserMapper } from './user.mapper';
import { find } from 'rxjs';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(@InjectModel('User') private readonly userModel: Model<UserDocument>) { }

    async create(userData: CreateUserDto): Promise<UserResponseDto> {
        this.logger.log(`Creating user: ${userData.email}`);
        const newUser = new this.userModel(userData);

        const savedUser = await newUser.save();

        return UserMapper.toResponseDto(savedUser);

    }

    async findOne(username: string): Promise<UserResponseDto | null> {


        const findUser = await this.userModel.findOne({ username }).exec();
        return findUser ? UserMapper.toResponseDto(findUser) : null;
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        const findUser = await this.userModel.findOne({ email }).exec();
        return findUser;
    }

    async findById(id: string): Promise<UserResponseDto | null> {
        const user = await this.userModel.findById(id).exec();
        return user ? UserMapper.toResponseDto(user) : null;
    }

    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.userModel.find().select('-password').exec();
        return UserMapper.toResponseDtoList(users);
    }
}
