import {Button} from '@heroui/react'
import {Icon} from '@iconify/react'
import {authClient} from '@/lib/auth/authClient'
import providers from '@/src/utils/global/providers'
import capitalize from '@/lib/functions/capitalize'

export default function Step1() {
  return providers.map(provider => {
    return (
      <Button
        slot="icon"
        key={provider.name}
        className="w-full"
        variant="tertiary"
        onPress={async () => {
          await authClient.signIn.social({
            provider: provider.name,
            callbackURL: '/register',
          })
        }}>
        <Icon
          icon={`logos:${provider.icon}`}
          className="w-fit p-1"
          width="24"
          height="24"
        />
        <span>Привязать {capitalize(provider.name)}</span>
      </Button>
    )
  })
}
