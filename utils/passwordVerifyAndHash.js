import bcrypt from 'bcrypt'

export async function hashPassword (pass) {
  const salt = await bcrypt.genSalt(10)
  const hashed = await bcrypt.hash(pass, salt)
  return hashed
};

export async function verifyPass (pass, hash) {
  return await bcrypt.compare(pass, hash)
};
