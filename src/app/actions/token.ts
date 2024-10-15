'use server'
import jwt from 'jsonwebtoken'
interface CreateToken {
  inviteCode: string
}
const inviteKey = process.env.INVITE_KEY || ''

export async function createToken({ inviteCode }: CreateToken) {
  'use server'
  const token = jwt.sign({ inviteCode }, inviteKey, { expiresIn: '1h' })
  return { token }
}

export async function verifyToken(token: string) {
  'use server'
  try {
    const decodedUriToken = decodeURIComponent(token)
    const decoded = jwt.verify(decodedUriToken, inviteKey)
    return decoded
  } catch (error) {
    console.log('Error al verificar el token', { error })
    return false
  }
}

export const getRoomFromToken = async (token: string) => {
  const decodedUriToken = decodeURIComponent(token)
  try {
    const decodedToken = (await jwt.decode(decodedUriToken)) as { inviteCode: string }
    return decodedToken.inviteCode
  } catch (error) {
    console.log(error)
    return null
  }
}
