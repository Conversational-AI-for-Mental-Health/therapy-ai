import { Request, Response } from 'express';
import twilioService from '../services/twilioService';
import { UserService } from '../services/userService';

const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

// Controller for handling emergency support requests
export const requestProfessionalSupport = async (req: Request, res: Response) => {
  try {
    const { userPhone, reason } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (userPhone && (typeof userPhone !== 'string' || !E164_PHONE_REGEX.test(userPhone))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use E.164 format like +14155552671.',
      });
    }

    if (reason && (typeof reason !== 'string' || reason.trim().length > 500)) {
      return res.status(400).json({
        success: false,
        message: 'Reason must be a string up to 500 characters.',
      });
    }

    const user = await UserService.findUserById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await twilioService.sendEmergencyRequest({
      userPhone,
      userName: user.name || 'Unknown User',
      userEmail: user.email || undefined,
      reason: reason || 'User requested professional mental health support',
    });

    if (result.success) {
      if (userPhone) {
        await twilioService.sendConfirmationToUser(userPhone);
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          notified: true,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error: any) {
    console.error('Error requesting professional support:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to contact professional support. Please try again.',
    });
  }
};