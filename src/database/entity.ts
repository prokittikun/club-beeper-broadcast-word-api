import { RoomSchema, SocketSchema } from './schema/room.schema';

export enum EntityEnum {
    roomDB = 'room',
    socketDB = 'socket',
}

export const EntityProviders = [
    { name: EntityEnum.roomDB, schema: RoomSchema },
    { name: EntityEnum.socketDB, schema: SocketSchema}
];
