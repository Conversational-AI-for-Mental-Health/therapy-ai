import { User } from '../../models';
import '../setup';

describe('User Model', () => {
  const VALID_PASSWORD_HASH =
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';

  it('should create a valid user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: VALID_PASSWORD_HASH,
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.createdAt).toBeDefined();
  });

  it('should fail without required email', async () => {
    const user = new User({
      name: 'John Doe',
      password_hash: VALID_PASSWORD_HASH,
    });

    await expect(user.save()).rejects.toThrow();
  });

  it('should fail with invalid email format', async () => {
    const user = new User({
      name: 'John Doe',
      email: 'invalid-email',
      password_hash: VALID_PASSWORD_HASH,
    });

    await expect(user.save()).rejects.toThrow();
  });
});
