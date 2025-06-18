import { isNil } from "lodash";
import moment from "moment";

interface Schedule {
  weekdayEn: string;
  startTime: string;
  endTime: string;
  inActivity?: boolean;
  currentSchedule?: boolean;
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

// Função simplificada para formatar os horários
export const formatScheduleInfo = (schedules: Schedule[]): string => {
  if (!Array.isArray(schedules) || schedules.length === 0) return "";

  return schedules
    .filter(s => s.startTime && s.endTime)
    .map(s => `${weekdays[s.weekdayEn] || s.weekdayEn}: ${s.startTime} - ${s.endTime}`)
    .join("\n");
};

// Função simplificada para formatar mensagem
export const formatOutOfHoursMessage = (message: string, scheduleInfo: string): string => {
  return `${message}\n\n*Horários de Funcionamento:*\n\n${scheduleInfo}`;
}; 
