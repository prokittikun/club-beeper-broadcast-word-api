import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';



// tslint:disable-next-line:max-classes-per-file
@Schema()
export class RoomDB extends Document {
  @Prop({ required: true })
  roomId: string;

  // @Prop({ required: false, default: [] })
  // clients: string[];

  @Prop({ required: false, default: [] })
  clients: Array<{
    clientId: string;
    role: string;
    activeAt?: Date;
  }>;

  @Prop({ required: true, default: 0 })
  status: number;

  @Prop({ type: Date, required: true, default: Date.now })
  createAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(RoomDB);
