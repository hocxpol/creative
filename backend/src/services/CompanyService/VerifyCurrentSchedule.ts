import moment from "moment";
import Company from "../../models/Company";
import { isNil } from "lodash";
import { Op } from "sequelize";

interface Schedule {
  weekdayEn: string;
  startTime: string;
  endTime: string;
  inActivity: boolean;
}

type Result = {
  id: number;
  currentSchedule: {
    weekdayEn: string;
    startTime: string;
    endTime: string;
    inActivity: boolean;
  };
  startTime: string;
  endTime: string;
  inActivity: boolean;
};

const getCurrentWeekday = (): string => {
  return moment().format("dddd").toLowerCase();
};

const VerifyCurrentSchedule = async (id: string | number): Promise<Result> => {
  const company = await Company.findOne({
    where: { id }
  });
  
  if (!company || !company.schedules || company.schedules.length === 0) {
    return {
      id: Number(id),
      currentSchedule: {
        weekdayEn: getCurrentWeekday(),
        startTime: "",
        endTime: "",
        inActivity: false
      },
      startTime: null,
      endTime: null,
      inActivity: false
    };
  }

  const now = moment();
  const weekday = now.format("dddd").toLowerCase();
  const { schedules } = company;
  
  let schedule: Schedule | undefined;
  if (Array.isArray(schedules) && schedules.length > 0) {
    schedule = schedules.find((s: Schedule) => 
      s.weekdayEn === weekday && 
      s.startTime !== "" && 
      s.startTime !== null && 
      s.endTime !== "" && 
      s.endTime !== null
    );
  }

  if (!schedule) {
    return {
      id: Number(id),
      currentSchedule: {
        weekdayEn: weekday,
        startTime: "",
        endTime: "",
        inActivity: false
      },
      startTime: null,
      endTime: null,
      inActivity: false
    };
  }

  const startTime = moment(schedule.startTime, "HH:mm");
  const endTime = moment(schedule.endTime, "HH:mm");
  const inActivity = now.isBetween(startTime, endTime);

  return {
    id: Number(id),
    currentSchedule: {
      weekdayEn: weekday,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      inActivity
    },
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    inActivity
  };
};

export default VerifyCurrentSchedule;
