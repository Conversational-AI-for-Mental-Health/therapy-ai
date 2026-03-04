import { requestProfessionalSupport } from '../../controllers/emergencyController';
import twilioService from '../../services/twilioService';
import { UserService } from '../../services/userService';

jest.mock('../../services/twilioService', () => ({
  __esModule: true,
  default: {
    sendEmergencyRequest: jest.fn(),
    sendConfirmationToUser: jest.fn(),
  },
}));

jest.mock('../../services/userService', () => ({
  UserService: {
    findUserById: jest.fn(),
  },
}));

const createRes = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { status, json };
};

describe('requestProfessionalSupport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when request is unauthenticated', async () => {
    const req: any = { body: {}, user: undefined };
    const res = createRes();

    await requestProfessionalSupport(req, res as any);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 for invalid phone format', async () => {
    const req: any = {
      body: { userPhone: '5551234' },
      user: { userId: '507f1f77bcf86cd799439011' },
    };
    const res = createRes();

    await requestProfessionalSupport(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(twilioService.sendEmergencyRequest).not.toHaveBeenCalled();
  });

  it('returns 400 for overly long reason', async () => {
    const req: any = {
      body: { reason: 'a'.repeat(501) },
      user: { userId: '507f1f77bcf86cd799439011' },
    };
    const res = createRes();

    await requestProfessionalSupport(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(twilioService.sendEmergencyRequest).not.toHaveBeenCalled();
  });

  it('sends request and returns success for valid payload', async () => {
    const req: any = {
      body: {
        userPhone: '+14155552671',
        reason: 'Need immediate professional support',
      },
      user: { userId: '507f1f77bcf86cd799439011' },
    };
    const res = createRes();

    (UserService.findUserById as jest.Mock).mockResolvedValue({
      name: 'Test User',
      email: 'test@example.com',
    });
    (twilioService.sendEmergencyRequest as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Professional support has been notified.',
    });
    (twilioService.sendConfirmationToUser as jest.Mock).mockResolvedValue(true);

    await requestProfessionalSupport(req, res as any);

    expect(UserService.findUserById).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
    expect(twilioService.sendEmergencyRequest).toHaveBeenCalled();
    expect(twilioService.sendConfirmationToUser).toHaveBeenCalledWith(
      '+14155552671',
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
