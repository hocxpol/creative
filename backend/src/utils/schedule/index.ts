import { isNil } from "lodash";

interface Schedule {
  weekdayEn: string;
  startTime: string;
  endTime: string;
  inActivity?: boolean;
}

const weekdays = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo"
};

const formatTime = (time: string): string => {
  if (!time) return "";
  // Remove any non-digit characters
  const digits = time.replace(/\D/g, "");
  // Add colon between hours and minutes
  return digits.length === 4 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : time;
};

export const formatScheduleInfo = (schedules: Schedule[]): string => {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return "";
  }

  const scheduleLines = schedules
    .filter(s => s.startTime && s.endTime)
    .map(s => {
      const weekday = weekdays[s.weekdayEn as keyof typeof weekdays] || s.weekdayEn;
      const startTime = formatTime(s.startTime);
      const endTime = formatTime(s.endTime);
      return `${weekday}: ${startTime} - ${endTime}`;
    });

  return scheduleLines.join("\n");
};

export const formatOutOfHoursMessage = (message: string | null, scheduleInfo: string): string | null => {
  if (!message) return null;
  return `${message}\n\n*Horários de Funcionamento:*\n\n${scheduleInfo}`;
};

export const isOutOfHours = (schedule: Schedule | null): boolean => {
  if (isNil(schedule)) return false;
  return !schedule || schedule.inActivity === false;
}; 