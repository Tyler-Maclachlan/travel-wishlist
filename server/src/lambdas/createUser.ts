import { LambdaResolver } from "../lambdaService";
import { User } from '../entity/User';

export interface ICreateUserArgs {
    socketId: string;
}

export const createUser: LambdaResolver<ICreateUserArgs> = async ({ args }) => {
    try {
        const { socketId } = args;
    
        const user = User.create({ socketId, locations: [] });

        await user.save();

        return true;
    } catch (error) {
        throw error;
    }
}