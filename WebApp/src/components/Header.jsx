const Header = () => {
  return (
    <header className="py-8">
      <div className="container mx-auto px-4 text-center">
        <h1
          role="heading"
          aria-level="1"
          className="text-4xl md:text-5xl font-bold text-center tracking-wider select-none
                    text-[#ffc0e2] [text-shadow:0_0_8px_#ffc0e2]"
        >
          BITSPLIT
        </h1>
        <p className="mt-2 text-sm md:text-base text-white opacity-80">
          Split bills easily with digital receipts
        </p>
      </div>
    </header>
  );
};

export default Header;