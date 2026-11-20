
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { findJobItems } from "../../data/mainMenuData";
import { isActiveParent, isActiveLink } from "../../utils/linkActiveChecker";

const HeaderNavContent = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const routes = [
      "/",
      "/company",
      "/blog-list-v1",
      ...findJobItems.flatMap(group => group.items.map(item => item.routePath))
    ];

    const uniqueRoutes = [...new Set(routes)];

    uniqueRoutes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  return (
    <nav className="nav main-menu">
      <ul className="navigation" id="navbar">
        <li className={pathname === "/" ? "current" : ""}>
          <Link href="/" prefetch={true}>Home</Link>
        </li>

        <li
          className={`${isActiveParent(findJobItems, pathname) ? "current" : ""} dropdown has-mega-menu`}
          id="has-mega-menu"
        >
          <span>Find Jobs</span>
          <div className="mega-menu">
            <div className="mega-menu-bar row align-items-start">
              {findJobItems.map(item => (
                <div className="column col-lg-3 col-md-3 col-sm-12" key={item.id}>
                  <h3>{item.title}</h3>
                  <ul>
                    {item.items.map(menu => (
                      <li
                        key={menu.routePath}
                        className={isActiveLink(menu.routePath, pathname) ? "current" : ""}
                      >
                        <Link href={menu.routePath} prefetch={true}>
                          {menu.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>

        <li className={pathname.startsWith("/company") ? "current" : ""}>
          <Link href="/company" prefetch={true}>Company</Link>
        </li>

        <li className={pathname.startsWith("/blog-list-v1") ? "current" : ""}>
          <Link href="/blog-list-v1" prefetch={true}>Blogs</Link>
        </li>
      </ul>
    </nav>
  );
};

export default HeaderNavContent;
