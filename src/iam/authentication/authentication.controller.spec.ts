import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { BadGatewayException } from '@nestjs/common';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { ForgotPassword } from '../dto/forgot-password.dto';
import { PasswordResetDto } from '../dto/password-reset.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignInDto } from '../dto/sign-in.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { AuthenticationService } from './services/authentication.service';
import { OtpAuthenticationService } from './services/otp-authentication.service';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  // let authService: AuthenticationService;
  // let otpAuthService: OtpAuthenticationService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    refreshTokens: jest.fn(),
    forgotPassword: jest.fn(),
    validateToken: jest.fn(),
    updatePassword: jest.fn(),
    activateAccount: jest.fn(),
  };

  const mockOtpAuthService = {
    generateSecret: jest.fn(),
    enableTfaForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
        {
          provide: OtpAuthenticationService,
          useValue: mockOtpAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    // authService = module.get<AuthenticationService>(AuthenticationService);
    // otpAuthService = module.get<OtpAuthenticationService>(
    //   OtpAuthenticationService,
    // );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should return user data on successful sign-up', async () => {
      const signUpDto: SignUpDto = {
        email: 'sani@mail.com',
        password: 'password1234',
        firstname: 'sani',
        lastname: 'sani',
      };
      const result = { id: 1, email: 'test@example.com' };
      mockAuthService.signUp.mockResolvedValue(result);

      expect(await controller.signUp(signUpDto)).toEqual(result);
    });
  });

  describe('signIn', () => {
    it('should return auth token on successful sign-in', async () => {
      const signInDto: SignInDto = {
        email: 'sani@mail.com',
        password: 'password',
      };
      const result = { accessToken: 'some-token', refreshToken: 'string' };
      mockAuthService.signIn.mockResolvedValue(result);

      expect(await controller.signIn(signInDto)).toEqual(result);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'token',
      };
      const result = { accessToken: 'new-token' };
      mockAuthService.refreshTokens.mockResolvedValue(result);

      expect(await controller.refreshToken(refreshTokenDto)).toEqual(result);
    });
  });

  describe('forgotPassword', () => {
    it('should call forgotPassword method', async () => {
      const payload: ForgotPassword = { email: 'test@example.com' };
      await controller.forgotPassword(payload);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        payload.email,
      );
    });
  });

  describe('resetPassword', () => {
    it('should update password if token is valid', async () => {
      const passwordResetDto: PasswordResetDto = {
        token: 'valid-token',
        newPassword: 'newPassword',
      };
      const payload = { sub: 1 }; // Mock payload
      mockAuthService.validateToken.mockResolvedValue(payload);
      await controller.resetPassword(passwordResetDto);
      expect(mockAuthService.updatePassword).toHaveBeenCalledWith(
        payload.sub,
        passwordResetDto.newPassword,
      );
    });

    it('should throw BadGatewayException for invalid token', async () => {
      const passwordResetDto: PasswordResetDto = {
        token: 'invalid-token',
        newPassword: 'newPassword',
      };
      mockAuthService.validateToken.mockResolvedValue(null);

      await expect(controller.resetPassword(passwordResetDto)).rejects.toThrow(
        BadGatewayException,
      );
    });
  });

  describe('activateAccount', () => {
    it('should activate account if token is valid', async () => {
      const activateAccountDto: ActivateAccountDto = { token: 'valid-token' };
      const payload = { sub: 1 }; // Mock payload
      mockAuthService.validateToken.mockResolvedValue(payload);
      await controller.activateAccount(activateAccountDto);
      expect(mockAuthService.activateAccount).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw BadGatewayException for invalid token', async () => {
      const activateAccountDto: ActivateAccountDto = {
        token: 'invalid-token',
      };
      mockAuthService.validateToken.mockResolvedValue(null);

      await expect(
        controller.activateAccount(activateAccountDto),
      ).rejects.toThrow(BadGatewayException);
    });
  });

  // describe('generateQrCode', () => {
  //   it('should generate QR code and return a stream', async () => {
  //     const activeUser = {
  //       email: 'test@example.com',
  //       sub: 1,
  //       roles: [Role.Admin],
  //     };
  //     const response: Response = { type: jest.fn(), send: jest.fn() } as any;
  //     const uri = 'some-uri';
  //     const secret = 'some-secret';
  //     mockOtpAuthService.generateSecret.mockResolvedValue({ secret, uri });
  //     mockOtpAuthService.enableTfaForUser.mockResolvedValue(null);

  //     await controller.generateQrCode(activeUser, response);
  //     expect(mockOtpAuthService.generateSecret).toHaveBeenCalledWith(
  //       activeUser.email,
  //     );
  //     expect(mockOtpAuthService.enableTfaForUser).toHaveBeenCalledWith(
  //       activeUser.email,
  //       secret,
  //     );
  //     expect(response.type).toHaveBeenCalledWith('png');
  //   });
  // });
});
