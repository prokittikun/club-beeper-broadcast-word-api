import { RoomSchema } from './schema/room.schema';

export enum EntityEnum {
  roomDB = 'room',
}

export const EntityProviders = [
  { name: EntityEnum.roomDB, schema: RoomSchema },
];
