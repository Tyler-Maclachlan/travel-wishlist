import { LambdaResolver } from "../lambdaService";
import { Location } from '../entity/Location';
import { User } from "../entity/User";

export interface IGetLocationsArgs {
    socketId?: string;
}

export const getLocations: LambdaResolver<IGetLocationsArgs> = async ({ args }) => {
    const { socketId } = args;

    try {
        const user = await User.findOne({ where: { socketId }});

        const locations = await Location.find({ where: { user }, relations: ['user'] });

        return locations.map(location => {
            const locationUserSocketId = location.user.socketId;
            delete location.user;

            return {
                ...location,
                socketId: locationUserSocketId
            }
        });
    } catch (error) {
        throw new Error('Error getting locations.');
    }
}