import "./App.css";
import { RecoilRoot } from "recoil";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Main } from "./pages/main/Main";

function App() {
  return (
    <RecoilRoot>
      <Theme>
        <Main />
      </Theme>
    </RecoilRoot>
  );
}

export default App;
