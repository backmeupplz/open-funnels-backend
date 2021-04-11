import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IDistinct } from './interfaces/distinct.interface';
import { Event, EventDocument } from './models/event.model';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async countUsersInSteps(steps: string[]) {
    const users = await this.eventModel.aggregate([
      {
        $group: {
          _id: '$userId',
          events: { $push: '$name' },
        },
      },
      { $match: { events: { $all: steps } } },
    ]);
    return users;
  }

  async distinct(index: IDistinct): Promise<any[]> {
    if (index.platform) {
      return this.eventModel.distinct('platform').exec();
    } else if (index.name) {
      return this.eventModel.distinct('name').exec();
    }
    return [];
  }
}
