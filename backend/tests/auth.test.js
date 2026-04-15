const authController = require('../src/controllers/authController');
const { Traveler, Host, Manager } = require('../src/models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../src/utils/appError');
const { sendOTPEmail } = require('../src/services/emailService');

jest.mock('../src/models/User');
jest.mock('jsonwebtoken');
jest.mock('../src/services/emailService');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('sendOTP', () => {
        it('should send OTP and return success', async () => {
            req.body.email = 'test@test.com';
            
            // Mocking sendOTPEmail
            sendOTPEmail.mockResolvedValue(true);
            process.env.NODE_ENV = 'production';

            await authController.sendOTP(req, res, next);
            
            expect(sendOTPEmail).toHaveBeenCalledWith('test@test.com', expect.any(String));
            expect(res.json).toHaveBeenCalledWith({ success: true, message: 'OTP sent successfully!' });
        });

        it('should return error if email is not provided', async () => {
            await authController.sendOTP(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('Email required');
        });
    });

    describe('login', () => {
        it('should login traveler successfully', async () => {
            req.body = { email: 'traveler@test.com', password: 'password123' };
            const mockTraveler = {
                _id: '123',
                name: 'Test Traveler',
                email: 'traveler@test.com',
                accountType: 'traveller',
                correctPassword: jest.fn().mockResolvedValue(true)
            };
            
            Traveler.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockTraveler)
            });

            jwt.sign.mockReturnValue('mocked_token');

            await authController.login(req, res, next);

            expect(Traveler.findOne).toHaveBeenCalledWith({ email: 'traveler@test.com' });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Login successful',
                token: 'mocked_token',
                user: expect.objectContaining({
                    email: 'traveler@test.com'
                })
            });
        });

        it('should return error on invalid credentials', async () => {
            req.body = { email: 'wrong@test.com', password: 'wrongpassword' };
            
            Traveler.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
            Host.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
        });
    });
});
