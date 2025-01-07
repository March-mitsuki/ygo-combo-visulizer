import { Outlet } from "react-router";
import { RootGrid, Main } from "./components/grid_design/inedx";
import { Nav } from "./nav";

export function Layout() {
  return (
    <RootGrid>
      <Nav />

      <Main
        as="main"
        py="2rem"
        // 48px is the height of the nav
        mt="48px"
      >
        <Outlet />
      </Main>
    </RootGrid>
  );
}
