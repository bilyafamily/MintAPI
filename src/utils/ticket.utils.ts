import { addBusinessDays, isWeekend } from 'date-fns';

export const calculateSLA = (startDate: Date, slaDays: number): Date => {
  let currentDate = new Date(startDate);

  while (slaDays > 0) {
    currentDate = addBusinessDays(currentDate, 1); // Add 1 business day
    if (!isWeekend(currentDate)) {
      slaDays--;
    }
  }

  return currentDate;
};

export const generateRandomString = (length = 12) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};

export const getCurrentTime = () => {
  const now = new Date();
  const plusOneHour = new Date(now);
  plusOneHour.setHours(plusOneHour.getHours() + 1);
  return plusOneHour;
};
