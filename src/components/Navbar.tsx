"use client";
import Link from "next/link";
import ThemeChanger from "./DarkSwitch";
import Image from "next/image"
import { Disclosure } from "@headlessui/react";
import { getAssetPath } from "@/lib/utils";

export const Navbar = () => {
  const navigation = [
    { name: "Products", href: "/" },
    { name: "Catalog", href: "/catalog" },
    { name: "Corporate", href: "/corporate" },
    { name: "Leadership", href: "/leadership" },
    { name: "Contact", href: "/" },
  ];

  return (
    <div className="w-full">
      <nav className="container relative flex flex-wrap items-center justify-between pt-8 px-8 pb-0 mx-auto lg:justify-between xl:px-1">
        {/* Logo  */}
        <Link href="/">
          <Image
            src={getAssetPath("/img/logo1.svg")}
            width="150"
            alt="Saavi Logo"
            height="150"
            className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32"
          />
        </Link>

        {/* get started  */}
        <div className="gap-3 nav__item mr-2 lg:flex ml-auto lg:ml-0 lg:order-2">
            <ThemeChanger />
            <div className="hidden mr-3 lg:flex nav__item">
              <Link href="/" className="px-6 py-2 text-white bg-saavi-gold hover:bg-saavi-gold-dark rounded-md md:ml-5">
                Shop Now
              </Link>
            </div>
        </div>
                
        <Disclosure>
          {({ open }) => (
            <div>
                <Disclosure.Button
                  aria-label="Toggle Menu"
                  className="px-2 py-1 text-gray-500 rounded-md lg:hidden hover:text-saavi-gold focus:text-saavi-gold focus:bg-saavi-gold focus:bg-opacity-10 focus:outline-none dark:text-gray-300 dark:focus:bg-trueGray-700">
                  <svg
                    className="w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                    {open && (
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                      />
                    )}
                    {!open && (
                      <path
                        fillRule="evenodd"
                        d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                      />
                    )}
                  </svg>
                </Disclosure.Button>

                <Disclosure.Panel className="flex flex-wrap w-full my-5 lg:hidden">
                  <div>
                    {navigation.map((item, index) => (
                      <Link key={index} href={item.href} className="w-full px-4 py-2 -ml-4 text-gray-500 rounded-md dark:text-gray-300 hover:text-saavi-gold focus:text-white focus:bg-saavi-gold focus:bg-opacity-90 dark:focus:bg-gray-800 focus:outline-none">
                          {item.name}
                      </Link>
                    ))}
                    <Link href="/" className="w-full px-6 py-2 mt-3 text-center text-white bg-saavi-gold hover:bg-saavi-gold-dark rounded-md lg:ml-5">         
                        Shop Now
                    </Link>
                  </div>
                </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
        
        {/* menu  */}
        <div className="hidden text-center lg:flex lg:items-center">
          <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
            {navigation.map((menu, index) => (
              <li className="mr-3 nav__item" key={index}>
                <Link href={menu.href} className="inline-block px-4 py-2 text-lg font-normal text-gray-800 no-underline rounded-md dark:text-gray-200 hover:text-saavi-gold focus:text-white focus:bg-saavi-gold focus:bg-opacity-90 focus:outline-none dark:focus:bg-gray-800">
                    {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </nav>
    </div>
  );
}

