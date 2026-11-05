import type { Access, FieldAccess } from 'payload'

type MaybeUser = { role?: string | null } | null | undefined

export const isAdminUser = (user: MaybeUser) => user?.role === 'admin'

export const anyone: Access = () => true
export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const adminOnly: Access = ({ req }) => isAdminUser(req.user as MaybeUser)
export const adminOnlyField: FieldAccess = ({ req }) => isAdminUser(req.user as MaybeUser)

/** Admins can manage everyone; editors can only see and update themselves. */
export const adminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  if (isAdminUser(req.user as MaybeUser)) return true
  return { id: { equals: req.user.id } }
}

/** Public sees published items only; logged-in editors see everything. */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

export const contentAccess = {
  read: anyone,
  create: loggedIn,
  update: loggedIn,
  delete: loggedIn,
}
