import { UserResponseDto } from "./dto/user.dto";
import { UserDocument } from "./schemas/user.schema";


export class UserMapper{
    
    static toResponseDto(user: UserDocument) : UserResponseDto{
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
        }
    } 
    static toResponseDtoList(users: UserDocument[]): UserResponseDto[]{
        return users.map(this.toResponseDto);
    }

}