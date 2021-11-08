import Delegate from "./delegate";
import { useRouter } from "next/router";

function Home({ changeTheme, ...props }) {
  const router = useRouter();
  const activePath = router.asPath;
  if (activePath.includes("/")) {
    return <Delegate props={props} changeTheme={changeTheme} />;
  } else {
    return <Delegate props={props} changeTheme={changeTheme} />;
  }
}

export default Home;
