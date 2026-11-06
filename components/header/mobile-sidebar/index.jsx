"use client";

import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { mobileMenuData } from "@/data/mobileMenuData";
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import { isActiveLink } from "../../../utils/linkActiveChecker";
import { usePathname, useRouter } from "next/navigation";

const Index = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="offcanvas offcanvas-start mobile_menu-contnet"
      tabIndex="-1"
      id="offcanvasMenu"
      data-bs-scroll="true"
    >
      <SidebarHeader />
      <Sidebar>
        <Menu>
          {mobileMenuData.map((menu, menuIndex) => {
            if (menu.single) {
              return (
                <MenuItem
                  key={menu.id ?? menu.routePath ?? `menu - ${menuIndex} `}
                  onClick={() => router.push(menu.routePath)}
                  className={
                    isActiveLink(menu.routePath, pathname)
                      ? "menu-active-link"
                      : ""
                  }
                >
                  {menu.name}
                </MenuItem>
              );
            }

            return (
              <SubMenu
                key={menu.id ?? `menu - ${menuIndex} `}
                label={menu.label}
                className={
                  menu.items?.some((group) =>
                    group.items?.some(
                      (item) => item.routePath === pathname
                    )
                  )
                    ? "menu-active"
                    : ""
                }
              >
                {menu.items?.map((group, groupIndex) => (
                  <SubMenu
                    key={group.id ?? `${menu.id ?? menuIndex} -group - ${groupIndex} `}
                    label={group.title}
                  >
                    {group.items?.map((item, itemIndex) => (
                      <MenuItem
                        key={item.routePath ?? `${group.id ?? groupIndex} -item - ${itemIndex} `}
                        onClick={() => router.push(item.routePath)}
                        className={
                          isActiveLink(item.routePath, pathname)
                            ? "menu-active-link"
                            : ""
                        }
                      >
                        {item.name}
                      </MenuItem>
                    ))}
                  </SubMenu>
                ))}
              </SubMenu>
            );
          })}
        </Menu>
      </Sidebar>
      <SidebarFooter />
    </div>
  );
};

export default Index;