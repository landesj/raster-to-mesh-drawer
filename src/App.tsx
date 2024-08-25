import "./App.css";
import { RecoilRoot } from "recoil";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Intro } from "./pages/intro/Intro";

function App() {
  return (
    <RecoilRoot>
      <Theme>
        <Intro />
      </Theme>
    </RecoilRoot>
  );
}

export default App;
