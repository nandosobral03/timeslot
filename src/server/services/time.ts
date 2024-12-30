import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const getCurrentTimeForScheduleItems = () => {
  // Get current time
  const now = dayjs().utc();
  const currentDayOfWeek = now.day();

  // Calculate seconds since start of day
  const secondsSinceMidnight = now.hour() * 3600 + now.minute() * 60 + now.second();

  // Calculate the reference time (Unix timestamp 0 + seconds for current time of day)
  const currentTimeInWeek = dayjs.unix(0).add(secondsSinceMidnight, "second").add(currentDayOfWeek, "day");

  return { currentTimeInWeek, currentDayOfWeek };
};
