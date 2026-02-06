import twilio from 'twilio';

interface SendSMSParams {
  userPhone?: string;
  userName?: string;
  userEmail?: string;
  reason?: string;
}

class TwilioService {
  private client;
  private fromNumber: string;
  private emergencyContacts: string[];

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    
    //mental health hotline therapists
    this.emergencyContacts = [
      process.env.PROFESSIONAL_CONTACT_1 || '',
      // Add more if needed
    ].filter(Boolean);

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured. SMS functionality will be disabled.');
      this.client = null;
      return;
    }

    this.client = twilio(accountSid, authToken);
  }

  async sendEmergencyRequest({
    userPhone,
    userName = 'Anonymous User',
    userEmail,
    reason = 'User requested professional mental health support'
  }: SendSMSParams): Promise<{ success: boolean; message: string; messageIds?: string[] }> {
    
    if (!this.client) {
      return {
        success: false,
        message: 'Twilio is not configured. Please contact support directly.'
      };
    }

    if (this.emergencyContacts.length === 0) {
      return {
        success: false,
        message: 'No professional contacts configured. Please contact support.'
      };
    }

    try {
      const timestamp = new Date().toLocaleString();
      const messageBody = `MENTAL HEALTH SUPPORT REQUEST
      
Time: ${timestamp}
User: ${userName}
Email: ${userEmail || 'Not provided'}
Phone: ${userPhone || 'Not provided'}
Reason: ${reason}This user has requested to speak with a mental health professional. Please respond as soon as possible.`;

      const sentMessages = await Promise.all(
        this.emergencyContacts.map(async (contactNumber) => {
          try {
            const message = await this.client!.messages.create({
              body: messageBody,
              from: this.fromNumber,
              to: contactNumber,
            });
            
            console.log(`SMS sent to ${contactNumber}: ${message.sid}`);
            return message.sid;
          } catch (error: any) {
            console.error(`Failed to send SMS to ${contactNumber}:`, error.message);
            return null;
          }
        })
      );

      const successfulMessages = sentMessages.filter(Boolean);

      if (successfulMessages.length > 0) {
        return {
          success: true,
          message: 'Professional support has been notified. Someone will contact you shortly.',
          messageIds: successfulMessages as string[]
        };
      } else {
        return {
          success: false,
          message: 'Failed to send notifications. Please try again or contact support directly.'
        };
      }
    } catch (error: any) {
      console.error('Twilio service error:', error);
      return {
        success: false,
        message: 'An error occurred while contacting support. Please try again.'
      };
    }
  }

  //send confirmation SMS to user
  async sendConfirmationToUser(userPhone: string): Promise<boolean> {
    if (!this.client || !userPhone) return false;

    try {
      const message = await this.client.messages.create({
        body: `Thank you for reaching out. A mental health professional has been notified and will contact you soon. If this is an emergency, please call 988 (Suicide & Crisis Lifeline) or 911 immediately.`,
        from: this.fromNumber,
        to: userPhone,
      });

      console.log(`Confirmation SMS sent to user: ${message.sid}`);
      return true;
    } catch (error: any) {
      console.error('Failed to send confirmation SMS:', error.message);
      return false;
    }
  }
}

export default new TwilioService();
