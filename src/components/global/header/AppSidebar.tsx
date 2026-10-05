import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import pathButtons from '@/src/utils/global/pathButtons'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import checkPermissions from '@/lib/functions/checkPermissions'
import {useSession} from '@/lib/auth/authClient'
import {LTWorker} from '@/src/utils/types'
import RankIcon from '@/src/components/global/RankIcon'
import ImpersonateBox from '@/src/components/global/ImpersonateBox'

const menuButtonClass =
  'h-11 gap-3 px-3 text-base [&_svg]:size-6 group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-3!'

const isActivePath = (pathname: string, href: string) =>
  href === '/'
    ? pathname === '/'
    : pathname === href || pathname.startsWith(href + '/')

const groups = pathButtons.filter(b => b.children?.length)
const noGroups = pathButtons.filter(b => !b.children?.length)

export default function AppSidebar() {
  const pathname = usePathname()
  const worker = useSession().data?.user as LTWorker | undefined

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex-row items-center gap-2 px-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:p-3">
        <RankIcon
          rank={worker?.rank || ''}
          className="shrink-0 group-data-[collapsible=icon]:size-8"
        />
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {worker?.name}
        </span>
        <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-1">
            {noGroups.map(button => {
              if (button.hide) return ''

              if (
                button.permission &&
                !checkPermissions([button.permission], worker)
              )
                return ''

              if (button.isDisabled && !checkPermissions(['admin'], worker))
                return ''

              return (
                <SidebarMenuItem key={button.name}>
                  <SidebarMenuButton
                    className={menuButtonClass}
                    tooltip={button.name}
                    isActive={isActivePath(pathname, button.href)}
                    render={<Link href={button.href} />}>
                    {button.icon && <button.icon />}
                    {button.name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
        {groups.map(group => (
          <SidebarGroup key={group.name}>
            <SidebarSeparator className="mx-0 mb-2" />
            {group.icon && (
              <div
                title={group.name}
                className="text-sidebar-foreground/70 hidden justify-center pb-2 group-data-[collapsible=icon]:flex">
                <group.icon className="size-5" />
              </div>
            )}
            <SidebarGroupLabel className="flex h-9 gap-1 text-sm">
              {group.icon && <group.icon />}
              <span>{group.name}</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.children?.map(button => {
                  if (button.hide) return ''

                  if (
                    button.permission &&
                    !checkPermissions([button.permission], worker)
                  )
                    return ''

                  if (button.isDisabled && !checkPermissions(['admin'], worker))
                    return ''

                  return (
                    <SidebarMenuItem key={button.name}>
                      <SidebarMenuButton
                        className={menuButtonClass}
                        tooltip={button.name}
                        isActive={isActivePath(pathname, button.href)}
                        render={<Link href={button.href} />}>
                        {button.icon && <button.icon />}
                        {button.name}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <ImpersonateBox />
      </SidebarFooter>
    </Sidebar>
  )
}
