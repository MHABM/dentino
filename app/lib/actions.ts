'use server'

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import {signIn} from '@/auth';
import {AuthError} from 'next-auth'
import axios from 'axios'
import Prisma from './prisma';

export type sendCodeType = {num:null|string,error: null|string|unknown}


export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function addNewHour(formData:FormData){
  const date= formData.get('date')?.toString();
  const hour= formData.get('hour')?.toString();

  try{
    await Prisma.hour.create({
      data: {
        day: date,
        hour: hour
      }
    });
    
  }catch(error){
    return{message: 'Database Error: Failed to Delete Invoice.'}
  }
  
  revalidatePath('/dashboard/calendar');
}

export async function deleteHour(formData:FormData) {
  const date= formData.get('date')?.toString();
  const hour= formData.get('hour')?.toString();

  try{
    await Prisma.hour.deleteMany({
      where: {
        hour: hour,
        day: date
      }
    });
  }catch(error){
    return{message: 'Database Error: Failed to Delete hour.'}
  }
  
  revalidatePath('/dashboard/calendar');
}

export async function sendCode(phone: string){
    var num = (Math.floor(Math.random() * 90000) + 10000).toString()

    var data = JSON.stringify({
        "mobile": phone,
        "templateId": "100000",
        "parameters": [
            { name: 'CODE', value: num },
        ],
    });

    var config = {
        method: 'post',
        url: 'https://api.sms.ir/v1/send/verify',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
            'x-api-key': 'ho1YH3zQm9lLy9UihDHcxAZfcPHsKFRIS4NylaCyHuSe60QgChT1qaX1vQB7cUWn'
        },
        data: data
    };

    try {
        const response = await axios(config);
        return num
    } catch (error) {
        console.error('Error sending verification code:', error);
    }
}

export async function booking(firstName:string,lastName:string,phoneNumber:string,day:string,hour:string){
  const condition = 'approved'
  
  try{
    await Prisma.appointment.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        day: day,
        hour: hour,
        condition: condition
      }
    });
    
  }catch(error){
    return{message: 'Database Error: Failed to Delete Invoice.'}
  }

}

export async function changeApprove(formData:FormData){
  const id = formData.get('id')?.toString();

  try{
    const appointment = await Prisma.appointment.findUnique({
      where: {
        id: id,
      },
    });
    
    let newCondition;
    if (appointment?.condition === 'approved') {
      newCondition = 'disapproved';
    } else {
      newCondition = 'approved';
    }
    
    await Prisma.appointment.update({
      where: {
        id: id,
      },
      data: {
        condition: newCondition,
      },
    });
       
  }catch(error){
    return{message: 'Database Error: Failed to Change Condition.'}
  }
  revalidatePath('/dashboard');
}