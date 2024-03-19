import { Link } from './components/link';

const Footer = () => {
  return (
    <div className="flex flex-col items-center text-sm text-gray-500">
      <div>This open-source initiative is released under the MIT License.</div>
      <div>
        It is mostly built upon <Link href="https://tevm.sh">Tevm</Link>.
      </div>
    </div>
  );
};

export default Footer;
