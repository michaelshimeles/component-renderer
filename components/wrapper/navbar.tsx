"use client"
import { NavigationMenu, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import config from "@/config";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Dialog, DialogClose } from "@radix-ui/react-dialog";
import Link from 'next/link';
import * as React from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import ModeToggle from "../mode-toggle";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { UserProfile } from "../user-profile";
import { Github } from "lucide-react";

export default function NavBar() {
    let userId = null;
    if (config?.auth?.enabled) {
        const user = useAuth();
        userId = user?.userId;
    }

    return (
        <div className="flex min-w-full fixed justify-between p-2 border-b z-10 dark:bg-black dark:bg-opacity-50 bg-white">
            <div className="flex justify-between w-full min-[825px]:hidden">
                <Dialog>
                    <SheetTrigger className="p-2 transition">
                        <Button size="icon" variant="ghost" className="w-4 h-4" aria-label="Open menu" asChild>
                            <GiHamburgerMenu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>component renderer</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col space-y-3 mt-[1rem]">
                            <DialogClose asChild>
                                <Link href="/">
                                    <Button variant="outline" className="w-full">Home</Button>
                                </Link>
                            </DialogClose>
                            {config?.features?.blog && <DialogClose asChild>
                                <Link href="/blog" legacyBehavior passHref className="cursor-pointer">
                                    <Button variant="outline">
                                        Blog
                                    </Button>
                                </Link>
                            </DialogClose>}
                        </div>
                    </SheetContent>
                </Dialog>
                <ModeToggle />
            </div>
            <NavigationMenu>
                <NavigationMenuList className="max-[825px]:hidden flex gap-3 w-[100%] justify-between">
                    <Link href="/" className="pl-2 flex items-center" aria-label="Home">
                        <p className='font-semibold'>component renderer</p>
                        <span className="sr-only">Home</span>
                    </Link>
                </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center gap-2 max-[825px]:hidden">
                <Link
                    href="https://github.com/michaelshimeles/component-renderer"
                    target='_blank'
                    className='animate-buttonheartbeat border p-2 rounded-full hover:dark:bg-black hover:cursor-pointer'
                    aria-label="View Component Renderer's Code On Github"
                >
                    <Github className='w-4 h-4' aria-hidden="true" />
                </Link>
                {userId && <UserProfile />}
                <ModeToggle />
            </div>
        </div>
    );
}
