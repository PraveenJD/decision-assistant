import Header from "./components/Header";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-auto">
        <HomePage />
      </div>
    </div>
  );
};

export default App;
