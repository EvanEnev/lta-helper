import {Session} from "next-auth";

export default function checkPermissions(permissions: string[], user: Session['user']) {
    const userPermissions = user?.permissions
    permissions.push('admin')

    return userPermissions?.some((permission: {name: string}) =>
        permissions.find(perm => perm.toLowerCase() === permission.name.toLowerCase())
    )
}
