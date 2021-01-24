import { LambdaResolver } from "../lambdaService";
import { ILocation } from '../app';
import { Location } from '../entity/Location';
import { User } from "../entity/User";

interface EditLocationArgs {
    locationId: string;
    location: ILocation;
}

export const editLocation: LambdaResolver<EditLocationArgs> = async ({args, ctx}) => {
    const { locationId, location } = args;
    const { socketId } = ctx;

    const user = await User.findOne({ where: { socketId }});
    const locationToEdit = await Location.findOne(locationId, { where: { user } });
    
    if (locationToEdit) {
        locationToEdit.title = location.title;
        locationToEdit.x = location.x;
        locationToEdit.y = location.y;

        try {
            await locationToEdit.save();

            delete locationToEdit.user;

            return { ...locationToEdit, socketId };
        } catch (error) {
            throw new Error('Error editing location.');
        }
    } else {
        throw new Error('User cannot edit this location.');
    }
}