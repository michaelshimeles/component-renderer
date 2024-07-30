import Link from 'next/link';
import { BorderBeam } from './magicui/border-beam';

const FloatingBadge = () => {
  return (
    <Link href="https://starter.rasmic.xyz" target='_blank' className="fixed bottom-4 right-4 bg-black border text-white px-3 py-2 rounded-full shadow-lg text-xs font-semibold z-50 hover:bg-zinc-800 transition-colors duration-300">
      Built using NextJS Starter Kit
      <BorderBeam size={60} duration={4} delay={4} />
    </Link>
  );
};

export default FloatingBadge;