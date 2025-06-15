import jwt from 'jsonwebtoken'
import { VerificationTag } from '../Database/VerificationTag.js'

export async function verifyToken (req, res, next) {
  try {
    const token = req.body.token
    const userIdReq = req.body.id
    if (token === null) {
      return res.status(403).send({ message: 'Forbidden' }) // if no cookies
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] }) // verify and decode token

    const { userId } = decoded
    if (userId !== userIdReq) {
      return res.status(403).send({ message: 'Forbidden' })
    }
    const data = await VerificationTag.findOne({ userId }) // find if the userid is in verificationtag schema
    if (!data) {
      return res.status(403).send({ message: 'Forbidden' }) // forbidden access
    }

    if (data.token !== token) {
      return res.status(403).send({ message: 'Forbidden' }) // Forbidden access -- posible man in middle attack
    }

    next()
  } catch (err) {
    console.error(err)
    return res.status(401).send({ message: 'Not Authorized' }) // some Error -- Not disclosing the type of error
  }
}
