import { FiGithub, FiLinkedin, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const iconStyle = "text-brand-lavender/80 hover:text-brand-pink transition-all duration-300 transform hover:scale-110";

  return (
    <footer className="py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center space-y-6">
        {/* Social Media Icons */}
        <div className="flex items-center space-x-6">
          <a
            href="https://github.com/tosaagi"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className={iconStyle}
          >
            <FiGithub size={24} />
          </a>
          <a
            href="https://linkedin.com/in/mochamad-ariva-alvitto"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className={iconStyle}
          >
            <FiLinkedin size={24} />
          </a>
          <a
            href="https://www.instagram.com/_alvitto"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Profile"
            className={iconStyle}
          >
            <FiInstagram size={24} />
          </a>
        </div>

        {/* Copyright & Credit Text */}
        <p className="text-center text-sm text-brand-lavender/80 select-none">
          &copy; {currentYear} <a
            href="https://arivaalvitto.azurewebsites.net"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-pink hover:text-white transition-colors"
            style={{ textShadow: '0 0 3px #ff79c6' }}
          >
            Vitto
          </a>. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
