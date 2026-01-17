"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export type MenuRole = "student" | "instructor" | "admin" | "guest";

export default function AccountMenu({
  isAuthed,
  accountHref,
  role,
  signInHref = "/auth/sign-in",
  signUpHref = "/auth/sign-up",
}: {
  isAuthed: boolean;
  accountHref: string;
  role: MenuRole;
  signInHref?: string;
  signUpHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={`nav-avatar nav-avatar--${role}`}
        aria-label="ანგარიში"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav-avatar__ring" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Zm0 2.2c-4.2 0-7.6 2.3-7.6 5.2 0 .8.6 1.4 1.4 1.4h12.4c.8 0 1.4-.6 1.4-1.4 0-2.9-3.4-5.2-7.6-5.2Z"
              fill="currentColor"
              opacity="0.92"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-black/80 backdrop-blur-md shadow-lg"
        >
          {isAuthed ? (
            <>
              <Link
                role="menuitem"
                href={accountHref}
                className="block px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                პირადი კაბინეტი
              </Link>

              {/* submit button: triggers parent <form action={signOutAction}> */}
              <button
                role="menuitem"
                type="submit"
                className="block w-full px-4 py-3 text-left text-sm text-white/85 hover:bg-white/10"
              >
                გამოსვლა
              </button>
            </>
          ) : (
            <>
              <Link
                role="menuitem"
                href={signInHref}
                className="block px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                შესვლა
              </Link>
              <Link
                role="menuitem"
                href={signUpHref}
                className="block px-4 py-3 text-sm text-white/85 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                რეგისტრაცია
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
