import Prisma from './prisma';
import { unstable_noStore as noStore } from 'next/cache';

export type hour={
  id: string,
  day: string,
  hour: string,
}

export async function fetchTimes(date:string) {
  noStore()

  try {
    const dateHours = await Prisma.hour.findMany({
      where: {
        day: date
      },
      select: {
        hour: true
      }
    });
    
    return dateHours;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch times.');
  }
}

export async function fetchTimesForPatient() {
  noStore()

  try {
    const nextFiveDays = await Prisma.hour.findMany({
      where: {
        day: {
          gt: new Date().toISOString().substring(0, 10),
        },
      },
      distinct: ['day'], // Ensure distinct dates
      orderBy: {
        day: 'asc', // Order by ascending date
      },
      take: 5, // Limit to the next five dates
    });
    
    const nextFiveDaysDates = nextFiveDays.map((hour: hour) => hour.day);
    
    const hoursForNextFiveDays = await Prisma.hour.findMany({
      where: {
        day: {
          in: nextFiveDaysDates, // Filter for hours on the next five dates
        },
      },
    });
    

    return{
      hoursForNextFiveDays
    };

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch times.');
  }
}

export async function fetchAppointments() {
  noStore()

  try {
    const appointments = await Prisma.appointment.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        day: true,
        hour: true,
        condition: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    return appointments

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch appointments.');
  }
}