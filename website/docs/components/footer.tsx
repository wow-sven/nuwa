import Link from "next/link";
import Logo from "@/components/nav-logo";
import {
  FaDiscord,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaMedium,
  FaTelegram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

// Define a constant array for social links
const SOCIAL_LINKS = [
  {
    label: "Github",
    href: "https://github.com/nuwa-protocol/",
    icon: <FaGithub className="h-6 w-6" />,
  },
  {
    label: "Twitter",
    href: "https://x.com/NuwaDev",
    icon: <FaXTwitter className="h-6 w-6" />,
  },
  {
    label: "Medium",
    href: "https://medium.com/@NuwaDev",
    icon: <FaMedium className="h-6 w-6" />,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/nuwadev/",
    icon: <FaInstagram className="h-6 w-6" />,
  },
  {
    label: "Youtube",
    href: "https://www.youtube.com/@NuwaDev",
    icon: <FaYoutube className="h-6 w-6" />,
  },
  {
    label: "Linkedin",
    href: "https://www.linkedin.com/company/nuwadev",
    icon: <FaLinkedin className="h-6 w-6" />,
  },
  {
    label: "Discord",
    href: "https://discord.gg/4yXE5UNFaJ",
    icon: <FaDiscord className="h-6 w-6" />,
  },
  {
    label: "Telegram",
    href: "https://t.me/nuwadev",
    icon: <FaTelegram className="h-6 w-6" />,
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-7xl mt-4 px-4 ">
        {/* Top area: Blocks */}
        <div
          className={`flex flex-col gap-8 py-8 md:py-12 lg:grid lg:grid-cols-12 lg:gap-10 border-t [border-image:linear-gradient(to_right,transparent,theme(colors.slate.200),transparent)1]`}
        >
          {/* Logo block */}
          <div className="lg:col-span-4 flex flex-col items-start justify-start">
            <Logo />
            <span className="text-xs pt-2 md:text-sm text-gray-600">
              &copy; Nuwa.Dev - All rights reserved.
            </span>
          </div>

          {/* 隐藏无内容区块在移动端，仅 lg 及以上显示 */}
          <div className="hidden lg:block lg:col-span-4"></div>

          {/* Social block */}
          <div className="space-y-2 sm:w-full lg:col-span-4">
            <ul className="flex gap-3 md:gap-2">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <Link
                    className="flex items-center justify-center text-purple-500 rounded-full w-10 h-10 transition hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    href={social.href}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
