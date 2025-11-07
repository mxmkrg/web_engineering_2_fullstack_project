"use client";

import {
  Calendar,
  Dumbbell,
  Home,
  LineChart,
  Settings,
  Target,
  User,
  ChevronUp,
  MoreHorizontal,
  Shield,
  Bug,
  BookOpen,
  Wrench,
} from "lucide-react";

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
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { logout } from "@/actions/logout";
import { useActionState } from "react";
import Link from "next/link";

// Current menu items (only implemented ones)
const currentItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Workouts",
    url: "/dashboard/workouts",
    icon: Dumbbell,
  },
  {
    title: "Routines",
    url: "/dashboard/routines",
    icon: BookOpen,
  },
  {
    title: "Progress",
    url: "/dashboard/progress",
    icon: LineChart,
  },
];

// Future menu items (coming soon)
const futureItems = [
  {
    title: "Schedule",
    url: "#",
    icon: Calendar,
    comingSoon: true,
  },
  {
    title: "Goals",
    url: "#",
    icon: Target,
    comingSoon: true,
  },
];

interface AppSidebarProps {
  userName?: string;
  userRole?: "user" | "admin";
}

export function AppSidebar({
  userName = "User",
  userRole = "user",
}: AppSidebarProps) {
  const [_logoutState, logoutAction] = useActionState(logout, {});

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                  <Dumbbell className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Workout Tracker
                  </span>
                  <span className="truncate text-xs">Fitness Journey</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {currentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Coming Soon</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {futureItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton disabled>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <User className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs">Settings</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/profile"
                    className="flex w-full items-center"
                  >
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className="flex w-full items-center"
                  >
                    <Settings className="mr-2 size-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/debug"
                    className="flex w-full items-center"
                  >
                    <Bug className="mr-2 size-4" />
                    Debug Tools
                  </Link>
                </DropdownMenuItem>
                {process.env.NODE_ENV === "development" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dev" className="flex w-full items-center">
                      <Wrench className="mr-2 size-4" />
                      Dev Tools
                    </Link>
                  </DropdownMenuItem>
                )}
                {userRole === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/admin"
                      className="flex w-full items-center"
                    >
                      <Shield className="mr-2 size-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <form action={logoutAction} className="w-full">
                    <button type="submit" className="flex w-full items-center">
                      <MoreHorizontal className="mr-2 size-4" />
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
