'use server';

import { prisma } from '@/lib/prisma';
import { calculatePeriods, formatDateTime } from '@/utils';
import { revalidatePath } from 'next/cache';
import z from 'zod';

const appointmentSchema = z.object({
  tutorName: z.string(),
  petName: z.string(),
  phone: z.string(),
  description: z.string(),
  scheduleAt: z.date(),
});

type AppointmentData = z.infer<typeof appointmentSchema>;

export async function createAppointment(data: AppointmentData) {
  try {
    const parsedData = appointmentSchema.parse(data);

    const { scheduleAt } = parsedData;
    const hour = parseInt(formatDateTime(scheduleAt));

    const { isMorning, isAfternoon, isEvening } = calculatePeriods(hour);

    console.log('aaaa');

    if (!isMorning && !isAfternoon && !isEvening) {
      return {
        error:
          'Agendamentos só podem ser feitos entre 9h-12h, 13h-18h e 19h-21h.',
      };
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        scheduleAt,
      },
    });

    if (existingAppointment) {
      return {
        error: 'Este horário já está reservado',
      };
    }

    await prisma.appointment.create({
      data: {
        ...parsedData,
      },
    });

    revalidatePath('/');
  } catch (error) {
    console.log(error);

    return {
      error: 'Ocorreu um erro ao tentar criar o agendamento.',
    };
  }
}

export async function updateAppointment(id: string, data: AppointmentData) {
  try {
    const parsedData = appointmentSchema.parse(data);

    const { scheduleAt } = parsedData;
    const hour = parseInt(formatDateTime(scheduleAt));

    const { isMorning, isAfternoon, isEvening } = calculatePeriods(hour);

    console.log('aaaa');

    if (!isMorning && !isAfternoon && !isEvening) {
      return {
        error:
          'Agendamentos só podem ser feitos entre 9h-12h, 13h-18h e 19h-21h.',
      };
    }

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        scheduleAt,
        id: {
          not: id,
        },
      },
    });

    if (existingAppointment) {
      return {
        error: 'Este horário já está reservado',
      };
    }

    await prisma.appointment.update({
      where: { id },
      data: { ...parsedData },
    });

    revalidatePath('/');
  } catch (error) {
    console.log(error);

    return {
      error: 'Ocorreu um erro ao tentar atualizar o agendamento.',
    };
  }
}

export async function deleteAppointment(id: string) {
  try {
    await prisma.appointment.delete({
      where: { id },
    });

    revalidatePath('/');
  } catch (error) {
    console.log(error);

    return {
      error: 'Ocorreu um erro ao tentar deletar o agendamento.',
    };
  }
}
