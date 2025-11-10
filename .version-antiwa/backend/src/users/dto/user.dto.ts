import { isString, IsString } from "class-validator"

export class CreateUserDto{
    @IsString()
    username: string

    @IsString()
    email: string

    @IsString()
    password: string
}
export class UserResponseDto{
    @IsString()
    id: string

    @IsString()
    username: string

    @IsString()
    email:string
}