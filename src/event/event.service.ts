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

  //TODO: Implement platform
  async countUsersInSteps(funnelData: {
    steps: string[];
    platform?: string;
    timeStart?: number;
  }): Promise<number> {
    const users = await this.eventModel.aggregate([
      {
        $group: {
          _id: '$userId',
          events: { $push: '$name' },
        },
      },
      { $match: { events: { $all: funnelData.steps } } },
    ]);
    if (funnelData.steps.length === 1) {
      return users.length;
    }
    let funnelCount = 0;
    for (const user of users) {
      const firstStepIndex = user.events.indexOf(funnelData.steps[0]);
      const lastStepIndex = user.events.lastIndexOf(
        funnelData.steps[funnelData.steps.length - 1],
      );
      if (firstStepIndex > lastStepIndex) continue;
      const searchArray = user.events.slice(firstStepIndex, lastStepIndex + 1);
      const hasSteps = funnelData.steps.every((val) => {
        return searchArray.includes(val);
      });
      if (hasSteps) funnelCount++;
    }
    return funnelCount;
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
