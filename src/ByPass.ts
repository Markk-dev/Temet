export const BYPASS_AUTH = true; // Set to false to disable bypass

export const BYPASS_USER = {
  $id: "bypass-user-id",
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  name: "Mark Vincent",
  email: "markvincent@gmail.com",
  registration: new Date().toISOString(),
  status: true,
  passwordUpdate: new Date().toISOString(),
  emailVerification: true,
  phone: "",
  phoneVerification: false,
  mfa: false,
  targets: [],
  accessedAt: new Date().toISOString(),
  prefs: {},
  labels: [],
};