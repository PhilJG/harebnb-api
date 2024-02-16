import { Router } from 'express'

const router = Router()

router.get('/signup', (req, res) => {
  res.send('sign up')
})

router.get('/login', (req, res) => {
  res.send('log in')
})

router.get('/logout', (req, res) => {
  res.send('log out')
})

export default router
