import icon from "../assets/images/novartis_logo.svg";

const Header = () => {
  return (
    <div className="h-20 border-b border-gray-200 shadow flex items-center justify-between px-10">
      <img src={icon} alt="novartis" className="w-64" />
      <h1 className="text-3xl font-bold">Personalised Decision Assistant</h1>
    </div>
  );
};

export default Header;
