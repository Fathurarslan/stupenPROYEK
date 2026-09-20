import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { NAV } from "../data/nav";

export default function Header() {
  const [buka, setBuka] = useState(false);
  const [dropdownTerbuka, setDropdownTerbuka] = useState<string | null>(null);
  const navRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!dropdownTerbuka) return;
    const tutup = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Escape") setDropdownTerbuka(null);
        return;
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setDropdownTerbuka(null);
      }
    };
    document.addEventListener("mousedown", tutup);
    document.addEventListener("keydown", tutup);
    return () => {
      document.removeEventListener("mousedown", tutup);
      document.removeEventListener("keydown", tutup);
    };
  }, [dropdownTerbuka]);

  return (
    <header className="sticky top-0 z-20 bg-sawah py-2 text-white shadow-lg">
      <div className="wrap flex h-16 items-center justify-between">
        <button
          type="button"
          className="hidden cursor-pointer rounded-md border border-white/40 bg-transparent px-2.5 py-1.5 text-white max-[860px]:block"
          aria-expanded={buka}
          onClick={() => {
            setBuka(!buka);
            setDropdownTerbuka(null);
          }}
        >
          {buka ? "Tutup" : "Menu"}
        </button>

        <ul
          ref={navRef}
          className={`m-0 flex list-none items-center gap-1 p-0 max-[860px]:absolute max-[860px]:top-16 max-[860px]:right-0 max-[860px]:left-0 max-[860px]:flex-col max-[860px]:items-stretch max-[860px]:bg-sawah max-[860px]:px-5 max-[860px]:pt-2 max-[860px]:pb-4 ${
            buka ? "max-[860px]:flex" : "max-[860px]:hidden"
          }`}
        >
          {NAV.map((n) =>
            n.children ? (
              <li key={n.label} className="relative max-[860px]:w-full">
                <button
                  type="button"
                  aria-expanded={dropdownTerbuka === n.label}
                  className="flex w-full cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent px-3 py-2 text-[14px] font-medium text-inherit hover:bg-white/12 max-[860px]:justify-between max-[860px]:opacity-100"
                  onClick={() =>
                    setDropdownTerbuka(
                      dropdownTerbuka === n.label ? null : n.label,
                    )
                  }
                >
                  {n.label}
                  <span aria-hidden="true">{dropdownTerbuka === n.label}</span>
                </button>
                <ul
                  className={`absolute top-full left-0 z-30 m-0 min-w-45 list-none flex-col rounded-md bg-white p-1 text-tinta shadow-lg max-[860px]:static max-[860px]:min-w-0 max-[860px]:bg-white max-[860px]:p-0 max-[860px]:text-sawah max-[860px]:shadow-none ${
                    dropdownTerbuka === n.label ? "flex" : "hidden"
                  }`}
                >
                  {n.children.map((c) => (
                    <li key={c.path}>
                      <Link
                        className="block rounded-md px-3 py-2 text-[14px] font-medium text-inherit no-underline hover:bg-sawah/10 max-[860px]:hover:bg-sawah/10"
                        to={c.path}
                        onClick={() => {
                          setBuka(false);
                          setDropdownTerbuka(null);
                        }}
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={n.path}>
                <Link
                  className="block rounded-md px-3 py-2 text-[14px] font-medium text-inherit no-underline hover:bg-white/12"
                  to={n.path!}
                  onClick={() => {
                    setBuka(false);
                    setDropdownTerbuka(null);
                  }}
                >
                  {n.label}
                </Link>
              </li>
            ),
          )}
        </ul>

        <Link to="/Login">
        <button
          type="button"
          className="cursor-pointer rounded-md bg-padi px-3 py-1.5 text-[16px] font-bold text-sawah hover:bg-padigelap hover:text-white max-[860px]:hidden"
          >
          Login Admin
        </button>
          </Link>
      </div>
    </header>
  );
}
