import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), '.data');

// Ensure .data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbFile = (name) => path.join(DATA_DIR, `${name}.json`);

const read = (name) => {
  const file = dbFile(name);
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
};

const write = (name, data) => {
  const file = dbFile(name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// Users Database
export const users = {
  create: (email, password, name) => {
    const all = read('users');
    if (all.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    const user = {
      id: crypto.randomBytes(12).toString('hex'),
      email,
      passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
      name,
      plan: 'Starter',
      emailVerified: false,
      verificationToken: crypto.randomBytes(32).toString('hex'),
      verificationTokenExpiry: Date.now() + 24*60*60*1000,
      createdAt: new Date().toISOString(),
      dailyQueriesUsed: 0,
      totalQueries: 0,
      lastQueryReset: new Date().toISOString(),
    };
    all.push(user);
    write('users', all);
    return user;
  },

  findByEmail: (email) => {
    const all = read('users');
    return all.find(u => u.email === email);
  },

  findById: (id) => {
    const all = read('users');
    return all.find(u => u.id === id);
  },

  update: (id, updates) => {
    const all = read('users');
    const user = all.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    write('users', all);
    return user;
  },

  verifyEmail: (token) => {
    const all = read('users');
    const user = all.find(u => u.verificationToken === token && u.verificationTokenExpiry > Date.now());
    if (!user) throw new Error('Invalid or expired verification token');
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    write('users', all);
    return user;
  },

  createPasswordReset: (email) => {
    const all = read('users');
    const user = all.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpiry = Date.now() + 1*60*60*1000; // 1 hour
    write('users', all);
    return resetToken;
  },

  resetPassword: (token, newPassword) => {
    const all = read('users');
    const user = all.find(u => u.passwordResetToken === token && u.passwordResetTokenExpiry > Date.now());
    if (!user) throw new Error('Invalid or expired reset token');
    user.passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    user.passwordResetToken = null;
    user.passwordResetTokenExpiry = null;
    write('users', all);
    return user;
  },

  incrementQueries: (id) => {
    const all = read('users');
    const user = all.find(u => u.id === id);
    if (!user) return null;
    user.dailyQueriesUsed = (user.dailyQueriesUsed || 0) + 1;
    user.totalQueries = (user.totalQueries || 0) + 1;
    write('users', all);
    return user;
  },

  resetDailyQueries: (id) => {
    const all = read('users');
    const user = all.find(u => u.id === id);
    if (!user) return null;
    user.dailyQueriesUsed = 0;
    user.lastQueryReset = new Date().toISOString();
    write('users', all);
    return user;
  },

  updatePlan: (id, plan) => {
    const all = read('users');
    const user = all.find(u => u.id === id);
    if (!user) return null;
    user.plan = plan;
    write('users', all);
    return user;
  },
};

// Portfolios Database
export const portfolios = {
  findByUserId: (userId) => {
    const all = read('portfolios');
    return all.filter(p => p.userId === userId);
  },

  addPosition: (userId, symbol, shares, entryPrice) => {
    const all = read('portfolios');
    const position = {
      id: crypto.randomBytes(12).toString('hex'),
      userId,
      symbol,
      shares: parseFloat(shares),
      entryPrice: parseFloat(entryPrice),
      createdAt: new Date().toISOString(),
    };
    all.push(position);
    write('portfolios', all);
    return position;
  },

  removePosition: (id) => {
    const all = read('portfolios');
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Position not found');
    all.splice(idx, 1);
    write('portfolios', all);
  },
};

// Subscriptions Database
export const subscriptions = {
  create: (email) => {
    const all = read('subscriptions');
    if (all.find(s => s.email === email)) {
      throw new Error('Already subscribed');
    }
    const sub = {
      id: crypto.randomBytes(12).toString('hex'),
      email,
      createdAt: new Date().toISOString(),
      unsubscribeToken: crypto.randomBytes(32).toString('hex'),
    };
    all.push(sub);
    write('subscriptions', all);
    return sub;
  },

  findByEmail: (email) => {
    const all = read('subscriptions');
    return all.find(s => s.email === email);
  },

  remove: (token) => {
    const all = read('subscriptions');
    const idx = all.findIndex(s => s.unsubscribeToken === token);
    if (idx === -1) throw new Error('Subscription not found');
    all.splice(idx, 1);
    write('subscriptions', all);
  },
};
