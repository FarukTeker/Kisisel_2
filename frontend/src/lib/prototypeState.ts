export interface PrototypeUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'reader' | 'curator' | 'commentator';
  followingSlugs: string[];
}

export const PROTOTYPE_USERS_KEY = 'prototypeUsers';
export const CURRENT_USER_KEY = 'prototypeCurrentUserId';

export const MOCK_TEST_USERS: PrototypeUser[] = [
  {
    id: 'user-deniz',
    name: 'Deniz Aydin',
    email: 'deniz@kisisel.test',
    password: 'deniz123',
    role: 'reader',
    followingSlugs: ['share-19d2b8'],
  },
  {
    id: 'user-ece',
    name: 'Ece Karaca',
    email: 'ece@kisisel.test',
    password: 'ece123',
    role: 'commentator',
    followingSlugs: ['campus-brief'],
  },
  {
    id: 'user-mert',
    name: 'Mert Yilmaz',
    email: 'mert@kisisel.test',
    password: 'mert123',
    role: 'reader',
    followingSlugs: [],
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function initializePrototypeState() {
  if (!canUseStorage()) return;

  if (!localStorage.getItem(PROTOTYPE_USERS_KEY)) {
    localStorage.setItem(PROTOTYPE_USERS_KEY, JSON.stringify(MOCK_TEST_USERS));
  }

  if (!localStorage.getItem(CURRENT_USER_KEY)) {
    localStorage.setItem(CURRENT_USER_KEY, MOCK_TEST_USERS[0].id);
  }
}

export function getPrototypeUsers(): PrototypeUser[] {
  if (!canUseStorage()) return MOCK_TEST_USERS;

  initializePrototypeState();
  const raw = localStorage.getItem(PROTOTYPE_USERS_KEY);
  return raw ? JSON.parse(raw) as PrototypeUser[] : MOCK_TEST_USERS;
}

export function savePrototypeUsers(users: PrototypeUser[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(PROTOTYPE_USERS_KEY, JSON.stringify(users));
}

export function getCurrentPrototypeUser(): PrototypeUser | null {
  if (!canUseStorage()) return null;

  initializePrototypeState();
  const currentUserId = localStorage.getItem(CURRENT_USER_KEY);
  return getPrototypeUsers().find((user) => user.id === currentUserId) || null;
}

export function setCurrentPrototypeUser(userId: string) {
  if (!canUseStorage()) return;
  localStorage.setItem(CURRENT_USER_KEY, userId);
  localStorage.setItem('isLoggedIn', 'true');
}

export function logoutPrototypeUser() {
  if (!canUseStorage()) return;
  localStorage.removeItem('isLoggedIn');
}

export function loginPrototypeUser(email: string, password: string) {
  const user = getPrototypeUsers().find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!user) return null;

  setCurrentPrototypeUser(user.id);
  return user;
}

export function registerPrototypeUser(name: string, email: string, password: string) {
  const users = getPrototypeUsers();
  const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
  if (exists) return { error: 'duplicate' as const };

  const newUser: PrototypeUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role: 'curator',
    followingSlugs: [],
  };

  const nextUsers = [...users, newUser];
  savePrototypeUsers(nextUsers);
  setCurrentPrototypeUser(newUser.id);
  return { user: newUser };
}

export function isFollowingSlug(slug: string) {
  const currentUser = getCurrentPrototypeUser();
  return currentUser ? currentUser.followingSlugs.includes(slug) : false;
}

export function toggleFollowSlug(slug: string) {
  const currentUser = getCurrentPrototypeUser();
  if (!currentUser) return null;

  const users = getPrototypeUsers();
  const nextUsers = users.map((user) => {
    if (user.id !== currentUser.id) return user;

    const followingSlugs = user.followingSlugs.includes(slug)
      ? user.followingSlugs.filter((item) => item !== slug)
      : [...user.followingSlugs, slug];

    return { ...user, followingSlugs };
  });

  savePrototypeUsers(nextUsers);
  return nextUsers.find((user) => user.id === currentUser.id) || null;
}
