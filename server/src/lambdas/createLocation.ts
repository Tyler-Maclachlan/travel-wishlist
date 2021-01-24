import { LambdaResolver } from "../lambdaService";
import { ILocation } from '../app';
import { Location } from '../entity/Location';
import { User } from '../entity/User';

interface CreateLocationArgs {
    location: ILocation;
}

export const createLocation: LambdaResolver<CreateLocationArgs> = async ({args, ctx}) => {
    const { location } = args;
    const { socketId } = ctx;
    
    const user = await User.findOne({ where: {socketId} });

    if (user) {
        try {
            const newLocation = Location.create({...location});
            await newLocation.save();

            user.locations.push(newLocation);
            await user.save();

            return newLocation;
        } catch (error) {
            throw new Error('Error creating location.');
        }
    } else {
        throw new Error('User does not exist.');
    }
}