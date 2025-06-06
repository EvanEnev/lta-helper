export default function checkPermissions(permissions: string[], worker: any) {
  const userPermissions = worker?.permissions
  permissions.push('admin')

  return userPermissions?.some((permission: {name: string}) =>
    permissions.find(
      perm => perm.toLowerCase() === permission.name.toLowerCase(),
    ),
  )
}
