import { LambdaResolver } from "../lambdaService";
import { Location } from '../entity/Location';
import { User } from "../entity/User";

interface DeleteLocationArgs {
    locationId: number;
}

export const deleteLocation: LambdaResolver<DeleteLocationArgs> = async ({args, ctx}) => {
    const { locationId } = args;
    const { socketId } = ctx;

    const user = await User.findOne({ where: { socketId }});
    const locationToDelete = await Location.findOne(locationId, { where: { user } });

    if (locationToDelete) {
        try {
            await locationToDelete.remove();
    
            return locationId;
        } catch (error) {
            throw new Error('Error deleting location.')
        }
    } else {
        throw new Error('User cannot delete this location.')
    }
}