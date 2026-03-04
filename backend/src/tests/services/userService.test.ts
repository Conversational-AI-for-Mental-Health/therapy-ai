import '../setup';
import { UserService } from '../../services/userService';
import { User } from '../../db/models';

describe('UserService refresh tokens', () => {
  it('stores refresh token hash in database', async () => {
    const user = await UserService.createUser(
      'Token User',
      'token-user@example.com',
      'Password123',
    );

    const rawToken = UserService.createRefreshTokenValue();
    const result = await UserService.storeRefreshToken(user._id, rawToken);

    expect(result.refreshToken).toBe(rawToken);

    const stored = await User.findById(user._id).select(
      '+refresh_tokens.token_hash +refresh_tokens.expires_at +refresh_tokens.created_at +refresh_tokens.revoked_at',
    );
    expect(stored?.refresh_tokens.length).toBe(1);
    expect(stored?.refresh_tokens[0].token_hash).toBeDefined();
    expect(stored?.refresh_tokens[0].token_hash).not.toBe(rawToken);
  });

  it('rotates refresh token and revokes old one', async () => {
    const user = await UserService.createUser(
      'Rotate User',
      'rotate-user@example.com',
      'Password123',
    );
    const oldToken = UserService.createRefreshTokenValue();
    await UserService.storeRefreshToken(user._id, oldToken);

    const rotated = await UserService.rotateRefreshToken(user._id, oldToken);
    expect(rotated).not.toBeNull();

    const stored = await User.findById(user._id).select(
      '+refresh_tokens.token_hash +refresh_tokens.expires_at +refresh_tokens.created_at +refresh_tokens.revoked_at',
    );
    const oldHash = UserService.hashToken(oldToken);
    const oldEntry = stored?.refresh_tokens.find((t) => t.token_hash === oldHash);
    expect(oldEntry?.revoked_at).toBeDefined();
    expect(stored?.refresh_tokens.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects unknown refresh token rotation', async () => {
    const user = await UserService.createUser(
      'Unknown User',
      'unknown-user@example.com',
      'Password123',
    );

    const rotated = await UserService.rotateRefreshToken(
      user._id,
      UserService.createRefreshTokenValue(),
    );
    expect(rotated).toBeNull();
  });
});
