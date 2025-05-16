import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarIcon, ClipboardListIcon } from "lucide-react";
import VNTTLogo from "../assets/VNTTLogo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "./ui/sidebar";


export default function SidebarLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const { state } = useSidebar();
  
  return (
        <Sidebar collapsible="icon" variant="sidebar">
          <SidebarHeader className="p-4 flex items-center justify-between">
            <div className={`flex items-center gap-3 ${state === "collapsed" ? "hidden" : ""}`}>
              <img 
                src={VNTTLogo} 
                alt="VNTT Logo" 
                className="h-7 w-auto object-contain" 
              />
              <h2 className={`text-base font-semibold ${state === "collapsed" ? "hidden" : ""}`}>{t("maintitle")}</h2>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  data-active={location.pathname === "/"}
                  asChild
                >
                  <Link to="/">
                    <CalendarIcon />
                    <span>{t("navigation.calendar") || "Calendar"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  data-active={location.pathname === "/attendance"}
                  asChild
                >
                  <Link to="/attendance">
                    <ClipboardListIcon />
                    <span>{t("navigation.attendance") || "Attendance Data"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
  );
}