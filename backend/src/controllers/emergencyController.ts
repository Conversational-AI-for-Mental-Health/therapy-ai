import { Request, Response } from 'express';
import twilioService from '../services/twilioService';

export const requestProfessionalSupport = async (req: Request, res: Response) => {
  try {
    const { userPhone, reason } = req.body;
    const user = (req as any).user; // From auth middleware

    const result = await twilioService.sendEmergencyRequest({
      userPhone,
      userName: user?.name || 'Anonymous User',
      userEmail: user?.email,
      reason: reason || 'User requested professional mental health support'
    });

    if (result.success) {
      // Optionally send confirmation to user if they provided their phone
      if (userPhone) {
        await twilioService.sendConfirmationToUser(userPhone);
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          notified: true,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error: any) {
    console.error('Error requesting professional support:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to contact professional support. Please try again.',
      error: error.message
    });
  }
};
